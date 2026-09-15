import test from "node:test"
import assert from "node:assert/strict"
import { loadModule } from "./test-modules.mjs"
const { initialState, transition, lockReason } = await loadModule("simrs/store")
const { patientSeed } = await loadModule("core/catalog")
const { validatePatient } = await loadModule("core/validation")
const { navigation, canAccess } = await loadModule("simrs/navigation")
const now = Date.now()
const act = (state, action, time = now) => transition(state, action, time)
const login = (state, role, id = "MHS-DEMO-01") =>
  act(state, { type: "login", role, participantId: id })
function started() {
  let state = act(initialState, {
    type: "reset",
    reason: "Pengujian percobaan baru",
  })
  state = login(state, "Mahasiswa")
  return act(state, { type: "start" })
}
function visit(state) {
  return {
    ...patientSeed,
    id: `KJ-${state.attempt.number}-001`,
    rm: "RM-SIM-0001",
    queue: "A-001",
    status: "Menunggu",
    note: "",
    paid: false,
    attempt: state.attempt.number,
    savedAt: new Date(now).toISOString(),
  }
}
function registered() {
  const state = started()
  return act(state, { type: "visit", visit: visit(state) })
}

test("menus agree with role allowlists and forbidden URLs", () => {
  for (const [role, groups] of Object.entries(navigation))
    for (const group of groups)
      for (const item of group.items)
        assert.equal(canAccess(role, item.path), true)
  assert.equal(canAccess("Mahasiswa", "penilaian"), false)
  assert.equal(canAccess("Dosen", "master-data"), false)
  assert.equal(canAccess("Administrator", "simulasi"), false)
})
test("empty and invalid patient data are rejected", () => {
  assert.equal(Object.keys(validatePatient(patientSeed)).length, 0)
  assert.ok(
    validatePatient({ ...patientSeed, identity: "1234567890123456" }).identity
  )
  assert.ok(
    validatePatient({ ...patientSeed, birthDate: "2999-01-01" }).birthDate
  )
  assert.ok(
    validatePatient({ ...patientSeed, name: "", payer: "Tidak ada" }).payer
  )
  const state = started()
  assert.equal(
    act(state, { type: "visit", visit: { ...visit(state), name: "" } }),
    state
  )
})
test("registration creates one visit and audit with prior/next values", () => {
  const state = registered()
  assert.equal(state.attempt.visits.length, 1)
  assert.equal(state.audit[0].action, "Pendaftaran pasien disimpan")
  assert.equal(state.audit[0].attempt, 2)
  assert.equal(state.audit[0].after, patientSeed.name)
})
test("duplicate registration cannot create a second visit", () => {
  const state = registered()
  assert.equal(act(state, { type: "visit", visit: visit(state) }), state)
})
test("wrong actor cannot register, edit notes or pay", () => {
  const state = registered()
  assert.equal(
    act(state, {
      type: "visit-update",
      id: state.attempt.visits[0].id,
      note: "Tidak boleh",
    }),
    state
  )
  const doctor = login(state, "Mahasiswa", "MHS-DEMO-03")
  assert.equal(
    act(doctor, {
      type: "visit",
      visit: { ...visit(doctor), identity: "SINT-0002" },
    }),
    doctor
  )
})
test("normal handoff progresses registration, service, billing", () => {
  let state = registered()
  const id = state.attempt.visits[0].id
  state = login(state, "Mahasiswa", "MHS-DEMO-03")
  state = act(state, { type: "visit-update", id, status: "Dilayani" })
  state = act(state, {
    type: "visit-update",
    id,
    status: "Selesai",
    note: "Pelayanan sesuai skenario sintetis.",
  })
  state = login(state, "Mahasiswa", "MHS-DEMO-06")
  state = act(state, { type: "visit-update", id, paid: true })
  assert.equal(state.attempt.visits[0].paid, true)
  assert.equal(state.audit[0].action, "Pembayaran dummy dicatat")
})
test("invalid service order and premature payment are rejected", () => {
  let state = login(registered(), "Mahasiswa", "MHS-DEMO-03")
  const id = state.attempt.visits[0].id
  assert.equal(
    act(state, {
      type: "visit-update",
      id,
      status: "Selesai",
      note: "Catatan",
    }),
    state
  )
  state = login(state, "Mahasiswa", "MHS-DEMO-06")
  assert.equal(act(state, { type: "visit-update", id, paid: true }), state)
})
test("completed notes cannot be silently changed", () => {
  let state = login(registered(), "Mahasiswa", "MHS-DEMO-03")
  const id = state.attempt.visits[0].id
  state = act(state, { type: "visit-update", id, status: "Dilayani" })
  state = act(state, {
    type: "visit-update",
    id,
    status: "Selesai",
    note: "Final",
  })
  assert.equal(
    act(state, { type: "visit-update", id, note: "Overwrite" }),
    state
  )
})
test("submission locks the submitting participant", () => {
  const state = act(registered(), { type: "submit" })
  assert.ok(lockReason(state, now).includes("terkunci"))
  assert.equal(
    act(state, {
      type: "visit",
      visit: { ...visit(state), identity: "SINT-0002" },
    }),
    state
  )
})
test("paused, ended and expired sessions reject mutations", () => {
  const original = registered()
  for (const status of ["Dijeda", "Ditutup"]) {
    const teacher = login(original, "Dosen")
    let state = act(teacher, {
      type: "session-status",
      status,
      reason: "Uji kondisi",
    })
    state = login(state, "Mahasiswa")
    assert.equal(
      act(state, {
        type: "visit",
        visit: { ...visit(state), identity: "SINT-0002" },
      }),
      state
    )
  }
  assert.equal(
    act(
      original,
      { type: "visit", visit: visit(original) },
      original.attempt.deadline + 1
    ),
    original
  )
})
test("reset preserves master, grades, visits history and audit", () => {
  const original = login(registered(), "Dosen")
  const state = act(original, { type: "reset", reason: "Latihan ulang" })
  assert.deepEqual(state.master, original.master)
  assert.deepEqual(state.reviews, original.reviews)
  assert.equal(state.attempt.number, 3)
  assert.equal(state.attempt.visits.length, 0)
  assert.equal(state.history.at(-1).visits.length, 1)
  assert.equal(state.audit.length, original.audit.length + 1)
})
test("new submission preserves a previous attempt review", () => {
  let state = login(registered(), "Mahasiswa", "MHS-DEMO-03")
  state = act(state, { type: "submit" })
  assert.equal(
    state.reviews.filter((r) => r.participantId === "MHS-DEMO-03").length,
    2
  )
})
test("reset requires teacher and a nonempty reason", () => {
  const state = registered()
  assert.equal(act(state, { type: "reset", reason: "" }), state)
  assert.equal(act(state, { type: "reset", reason: "Uji" }), state)
})
test("published scenarios and anonymous mutations are denied", () => {
  assert.equal(
    act(initialState, {
      type: "scenario",
      scenario: { ...initialState.scenarios[0], title: "Changed" },
    }),
    initialState
  )
  const anonymous = act(registered(), { type: "logout" })
  assert.equal(
    act(anonymous, { type: "visit", visit: visit(anonymous) }),
    anonymous
  )
})
