import test from "node:test"
import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import { loadModule } from "./test-modules.mjs"
const { executeCore, billSummary, operationalSummary } =
  await loadModule("core/engine")
const { createCoreState, patientSeed } = await loadModule("core/catalog")
const { initialState, transition } = await loadModule("simrs/store")
const { DemoServer } = await loadModule("server/runtime")
const { accounts } = await loadModule("platform/accounts")
const { masterCategories } = await loadModule("core/types")
const { visitJourney, journeyText } = await loadModule("core/journey")
const { nextPatientExample } = await loadModule("core/catalog")
const { coreInputEntry, safeCoreDestination } =
  await loadModule("simrs/core-entry")
const now = Date.now(),
  registrar = {
    id: "REG",
    name: "Petugas contoh",
    active: true,
    capabilities: ["patient.write", "registration.write", "queue.write"],
  },
  doctor = {
    id: "DOC",
    name: "Dokter contoh",
    active: true,
    capabilities: ["queue.write", "record.write", "record.finalize"],
  },
  cashier = {
    id: "CASH",
    name: "Kasir contoh",
    active: true,
    capabilities: ["cashier.write"],
  },
  admin = {
    id: "ADM",
    name: "Administrator",
    active: true,
    capabilities: ["master.write"],
  }
const run = (state, command, principal = registrar) =>
  executeCore(state, command, principal, now).state
const register = (state = createCoreState(), patient = patientSeed) =>
  run(state, {
    type: "registration.create",
    patient,
    unit: "Poli Umum",
    payer: "Umum",
    verified: true,
    serviceId: "LAY-002",
  })
function served() {
  let state = register(),
    id = state.visits[0].id
  state = run(state, { type: "queue.transition", id, status: "Dipanggil" })
  state = run(state, { type: "visit.verify", id }, doctor)
  state = run(
    state,
    { type: "queue.transition", id, status: "Dilayani" },
    doctor
  )
  state = run(
    state,
    {
      type: "record.save",
      id,
      data: {
        ...state.visits[0].record.data,
        note: "Catatan pelayanan sintetis.",
        complaint: "Keluhan contoh",
        examination: "Pemeriksaan contoh",
        diagnosisId: "DX-DEMO-01",
        procedureIds: ["TIN-001"],
      },
    },
    doctor
  )
  state = run(state, { type: "record.finalize", id }, doctor)
  return run(state, { type: "queue.transition", id, status: "Selesai" }, doctor)
}
const payment = (state, kind, amount) =>
  run(
    state,
    {
      type: "payment.record",
      id: state.visits[0].id,
      kind,
      amount,
      reason: "Transaksi pengujian",
    },
    cashier
  )
test("input recovery selects the assigned active account without giving teachers write access", () => {
  const state = structuredClone(initialState)
  const entry = coreInputEntry(state, "pendaftaran")
  assert.equal(entry.canWrite, false)
  assert.equal(entry.account.id, "MHS-DEMO-01")
  assert.equal(
    new URL(entry.loginPath, "http://localhost").searchParams.get("lanjut"),
    "/simrs/pendaftaran"
  )
  state.participants[0].actor = "Dokter"
  state.participants[1].actor = "Petugas Pendaftaran"
  assert.equal(coreInputEntry(state, "pendaftaran").account.id, "MHS-DEMO-02")
  state.participants.unshift({ ...state.participants[1], id: "MHS-DEMO-07" })
  assert.equal(coreInputEntry(state, "pendaftaran").account.id, "MHS-DEMO-02")
  assert.equal(coreInputEntry(state, "master").account.id, "ADMIN-DEMO")
})
test("return destination rejects external URLs, unknown routes and unauthorized modules", () => {
  for (const path of [
    "https://example.com",
    "//example.com",
    "javascript:alert(1)",
    "/simrs/unknown",
    "/simrs/pendaftaran?next=https://example.com",
    "/simrs/../pengguna",
  ])
    assert.equal(safeCoreDestination(path, "Dosen"), null)
  assert.equal(safeCoreDestination("/simrs/kasir", "Mahasiswa", "Dokter"), null)
  assert.equal(
    safeCoreDestination("/simrs/master", "Mahasiswa", "Petugas Pendaftaran"),
    null
  )
  assert.equal(
    safeCoreDestination(
      "/simrs/pendaftaran",
      "Mahasiswa",
      "Petugas Pendaftaran"
    ),
    "/simrs/pendaftaran"
  )
  assert.equal(
    safeCoreDestination("/simrs/master", "Administrator"),
    "/simrs/master"
  )
})
test("input navigation retains briefing, locked submissions and existing transactions", () => {
  let state = structuredClone(initialState)
  const masterBefore = structuredClone(state.hospitalMaster)
  state = transition(
    state,
    { type: "reset", reason: "Uji akses input" },
    now,
    true
  )
  state = transition(
    state,
    { type: "login", role: "Mahasiswa", participantId: "MHS-DEMO-01" },
    now,
    true
  )
  const entry = coreInputEntry(state, "pendaftaran")
  assert.equal(entry.canWrite, true)
  assert.equal(entry.briefingPath, "/sesi-aktif?lanjut=%2Fsimrs%2Fpendaftaran")
  assert.throws(
    () =>
      transition(
        state,
        {
          type: "core",
          command: { type: "patient.create", patient: patientSeed },
          sessionId: state.activeSessionId,
          attemptNumber: state.attempt.number,
        },
        now,
        true
      ),
    /briefing/
  )
  state = transition(state, { type: "start" }, now, true)
  state = transition(state, { type: "visit", visit: patientSeed }, now, true)
  const visitsBefore = structuredClone(state.attempt.core.visits)
  state = transition(
    state,
    { type: "login", role: "Dosen", participantId: "MHS-DEMO-01" },
    now,
    true
  )
  assert.deepEqual(state.attempt.core.visits, visitsBefore)
  assert.deepEqual(state.hospitalMaster, masterBefore)
})
test("core has no academic/store dependency or education fields", async () => {
  for (const file of await readdir(new URL("../lib/core/", import.meta.url))) {
    const source = await readFile(
      new URL(`../lib/core/${file}`, import.meta.url),
      "utf8"
    )
    assert.doesNotMatch(
      source,
      /from ["'][^"']*(?:simrs|academic|assessment)|scenarioId|attemptNumber|participantId|courseId|studentId/
    )
  }
  const visit = register().visits[0]
  assert.equal("attempt" in visit, false)
})
test("all master categories accept input with stable IDs and audit facts", () => {
  let state = createCoreState()
  for (const category of masterCategories) {
    const result = executeCore(
      state,
      {
        type: "master.save",
        data: {
          category,
          name: `${category} Sintetis Uji`,
          detail: "Rincian input sintetis",
          status: "Aktif",
          amount: 30000,
        },
        reason: "Persiapan data uji",
      },
      admin,
      now
    )
    state = result.state
    const row = state.master.rows.at(-1)
    assert.equal(result.fact.object, row.id)
    assert.equal(result.fact.action, "Master ditambahkan")
    state = run(
      state,
      {
        type: "master.save",
        data: { ...row, detail: "Rincian diperbarui", amount: 35000 },
        reason: "Koreksi data uji",
      },
      admin
    )
    assert.equal(
      state.master.rows.find((r) => r.id === row.id).detail,
      "Rincian diperbarui"
    )
    if (category === "Poli") assert.ok(state.master.units.includes(row.name))
    if (category === "Penjamin")
      assert.ok(state.master.payers.includes(row.name))
    if (category === "Diagnosis")
      assert.ok(state.master.diagnoses.some((d) => d.id === row.id))
    if (["Layanan & tarif", "Tindakan"].includes(category))
      assert.equal(
        state.master.services.find((s) => s.id === row.id).amount,
        35000
      )
  }
})
test("master rejects invalid, duplicate, unauthorized and destructive option changes", () => {
  const state = createCoreState()
  const command = {
    type: "master.save",
    data: {
      category: "Poli",
      name: "Poli Umum",
      detail: "Uji",
      status: "Aktif",
    },
    reason: "Uji",
  }
  assert.throws(() => run(state, command, registrar), /diizinkan/)
  assert.throws(() => run(state, command, admin), /sudah tersedia/)
  assert.throws(
    () =>
      run(state, { ...command, data: { ...command.data, name: "" } }, admin),
    /formulir/
  )
  assert.throws(
    () =>
      run(
        state,
        {
          ...command,
          data: { ...command.data, id: "POLI-001", status: "Nonaktif" },
        },
        admin
      ),
    /Minimal satu/
  )
  assert.throws(
    () =>
      run(
        state,
        {
          ...command,
          data: {
            ...state.master.rows.find((r) => r.id === "LAY-001"),
            status: "Nonaktif",
            amount: 15000,
          },
        },
        admin
      ),
    /harus tetap aktif/
  )
  assert.throws(
    () =>
      run(
        state,
        {
          ...command,
          data: { ...command.data, name: "Poli Lain" },
          reason: "",
        },
        admin
      ),
    /Alasan/
  )
})
test("inactive operational master options disappear without deleting catalog history", () => {
  let state = createCoreState()
  state = run(
    state,
    {
      type: "master.save",
      data: {
        category: "Poli",
        name: "Poli Sintetis Tambahan",
        detail: "Uji",
        status: "Aktif",
      },
      reason: "Uji",
    },
    admin
  )
  const row = state.master.rows.at(-1)
  state = run(
    state,
    {
      type: "master.save",
      data: { ...row, status: "Nonaktif" },
      reason: "Tutup pilihan",
    },
    admin
  )
  assert.equal(
    state.master.rows.find((r) => r.id === row.id).status,
    "Nonaktif"
  )
  assert.equal(state.master.units.includes(row.name), false)
})
test("patient correction preserves RM, appointments, visits and payer snapshots", () => {
  let state = register()
  const patient = state.patients[0],
    visit = structuredClone(state.visits[0])
  state = run(state, {
    type: "appointment.create",
    patientId: patient.id,
    unit: "Poli Umum",
    date: "2026-10-02",
    time: "10:30",
  })
  const result = executeCore(
    state,
    {
      type: "patient.update",
      id: patient.id,
      patient: {
        ...patientSeed,
        name: "Pasien Sintetis Dikoreksi",
        payer: "JKN Simulasi",
        contact: "KONTAK-SINT-0001",
      },
      reason: "Perbaikan input",
    },
    registrar,
    now
  )
  assert.equal(result.state.patients[0].rm, patient.rm)
  assert.deepEqual(result.state.visits[0], visit)
  assert.equal(result.state.appointments[0].patientId, patient.id)
  assert.match(result.fact.before, /Pasien Sintetis 001/)
  assert.match(result.fact.after, /Dikoreksi/)
  assert.throws(
    () =>
      run(served(), {
        type: "patient.update",
        id: patient.id,
        patient: patientSeed,
        reason: "Uji terkunci",
      }),
    /final terkunci/
  )
})
test("repeat testing generates unused patient examples without inserting data", () => {
  const state = register()
  const sample = nextPatientExample(state)
  assert.equal(sample.identity, "SINT-0002")
  assert.equal(state.patients.length, 1)
  assert.equal(sample.unit, state.master.units[0])
})
test("journey reflects actual transitions, cancellation, payment and allowed exports", () => {
  const registered = register().visits[0]
  assert.equal(visitJourney(registered, registrar)[1].status, "Menunggu")
  assert.equal(visitJourney(registered, registrar)[5].status, "Sesuai akses")
  let state = served()
  state = payment(state, "Pembayaran", 90000)
  const viewer = { ...doctor, capabilities: ["record.read", "billing.read"] }
  assert.equal(visitJourney(state.visits[0], viewer)[5].status, "Lunas")
  assert.match(journeyText(state, state.visits[0], viewer), /90000|90.000/)
  const restricted = journeyText(state, state.visits[0], registrar)
  assert.doesNotMatch(
    restricted,
    /Catatan pelayanan sintetis|90000|90.000|RIWAYAT PEMBAYARAN/
  )
  const cancelled = run(register(), {
    type: "queue.transition",
    id: "KJ-001",
    status: "Tidak datang",
    reason: "Tidak hadir",
  })
  assert.equal(
    visitJourney(cancelled.visits[0], viewer)[2].status,
    "Dihentikan"
  )
  assert.match(
    journeyText(cancelled, cancelled.visits[0], viewer),
    /Tidak hadir/
  )
})
test("canonical synthetic patient can have successive visits under one RM", () => {
  let state = served()
  const patient = state.patients[0]
  state = run(state, {
    type: "registration.create",
    patientId: patient.id,
    unit: "Poli Umum",
    payer: "Umum",
    verified: true,
    serviceId: "LAY-002",
  })
  assert.equal(state.patients.length, 1)
  assert.equal(state.visits.length, 2)
  assert.equal(state.patients[0].rm, patient.rm)
  assert.equal(state.visits[1].queue, "A-002")
})
test("patient validation, duplicate identity and simultaneous duplicate visits are rejected", () => {
  assert.throws(() =>
    register(createCoreState(), { ...patientSeed, birthDate: "2026-02-30" })
  )
  const state = register()
  assert.throws(() => register(state))
  assert.throws(() =>
    run(state, { type: "patient.create", patient: patientSeed })
  )
  assert.throws(() =>
    run(state, {
      type: "registration.create",
      patientId: state.patients[0].id,
      unit: "Poli Umum",
      payer: "Umum",
      verified: true,
      serviceId: "LAY-002",
    })
  )
})
test("registration ignores neither missing verification nor invalid tariffs", () => {
  assert.throws(() =>
    run(createCoreState(), {
      type: "registration.create",
      patient: patientSeed,
      unit: "Poli Umum",
      payer: "Umum",
      verified: false,
      serviceId: "LAY-002",
    })
  )
  const state = createCoreState()
  state.master.services[0].amount = -1
  assert.throws(() => register(state))
  assert.equal(state.patients.length, 0)
})
test("new patient and simple appointment check-in share the same registration engine", () => {
  let state = run(createCoreState(), {
    type: "patient.create",
    patient: patientSeed,
  })
  state = run(state, {
    type: "appointment.create",
    patientId: state.patients[0].id,
    unit: "Poli Umum",
    date: "2026-10-01",
    time: "09:00",
  })
  state = run(state, {
    type: "registration.create",
    patientId: state.patients[0].id,
    unit: "Poli Umum",
    payer: "Umum",
    verified: true,
    serviceId: "LAY-002",
    appointmentId: state.appointments[0].id,
  })
  assert.equal(state.visits[0].arrival, "Appointment")
  assert.equal(state.appointments[0].status, "Terdaftar")
  assert.equal(state.patients.length, 1)
})
test("appointment cancellation and no-show are terminal and audited", () => {
  for (const status of ["Dibatalkan", "Tidak datang"]) {
    let state = run(createCoreState(), {
      type: "patient.create",
      patient: patientSeed,
    })
    state = run(state, {
      type: "appointment.create",
      patientId: state.patients[0].id,
      unit: "Poli Umum",
      date: "2026-10-01",
      time: "09:00",
    })
    const result = executeCore(
      state,
      {
        type: "appointment.close",
        id: state.appointments[0].id,
        status,
        reason: "Tidak dapat hadir",
      },
      registrar,
      now
    )
    assert.equal(result.state.appointments[0].status, status)
    assert.ok(result.fact.before)
    assert.throws(() =>
      run(result.state, {
        type: "appointment.close",
        id: state.appointments[0].id,
        status,
        reason: "Ulang",
      })
    )
  }
})
test("queue cannot skip call, verification, or finalization", () => {
  let state = register(),
    id = state.visits[0].id
  assert.throws(() =>
    run(state, { type: "queue.transition", id, status: "Selesai" }, doctor)
  )
  assert.throws(() =>
    run(state, { type: "queue.transition", id, status: "Dilayani" }, doctor)
  )
  state = run(state, { type: "queue.transition", id, status: "Dipanggil" })
  assert.throws(() =>
    run(state, { type: "queue.transition", id, status: "Dilayani" }, doctor)
  )
  state = run(state, { type: "visit.verify", id }, doctor)
  state = run(
    state,
    { type: "queue.transition", id, status: "Dilayani" },
    doctor
  )
  assert.throws(() =>
    run(state, { type: "queue.transition", id, status: "Selesai" }, doctor)
  )
})
test("queue cancellation/no-show cancels administrative charge without deleting evidence", () => {
  for (const status of ["Dibatalkan", "Tidak datang"]) {
    let state = register()
    const id = state.visits[0].id
    assert.throws(() =>
      run(state, { type: "queue.transition", id, status, reason: "" })
    )
    state = run(state, {
      type: "queue.transition",
      id,
      status,
      reason: "Pasien tidak hadir",
    })
    assert.equal(state.visits.length, 1)
    assert.equal(state.visits[0].status, status)
    assert.equal(billSummary(state.visits[0]).total, 0)
    assert.throws(() =>
      run(state, { type: "queue.transition", id, status: "Dipanggil" })
    )
  }
})
test("record finalization and correction preserve all versions and financial facts", () => {
  let state = served(),
    id = state.visits[0].id
  const original = structuredClone(state.visits[0])
  assert.throws(() =>
    run(
      state,
      {
        type: "record.save",
        id,
        data: { ...original.record.data, note: "Overwrite" },
      },
      doctor
    )
  )
  state = run(
    state,
    {
      type: "record.correct",
      id,
      data: { ...original.record.data, note: "Koreksi catatan contoh" },
      reason: "Perbaikan dokumentasi",
    },
    doctor
  )
  assert.deepEqual(
    state.visits[0].record.versions.slice(0, -1),
    original.record.versions
  )
  assert.deepEqual(state.visits[0].charges, original.charges)
  assert.throws(() =>
    run(
      state,
      {
        type: "record.correct",
        id,
        data: { ...original.record.data, procedureIds: [] },
        reason: "Ubah tindakan",
      },
      doctor
    )
  )
  assert.throws(() =>
    run(
      state,
      { type: "record.correct", id, data: original.record.data, reason: "" },
      doctor
    )
  )
})
test("billing uses actual services and snapshots prices rather than a flat total", () => {
  const state = served()
  assert.equal(billSummary(state.visits[0]).total, 90000)
  assert.equal(register().visits[0].charges.length, 1)
  const updated = run(
    state,
    {
      type: "master.tariff",
      id: "LAY-002",
      amount: 80000,
      reason: "Tarif baru",
    },
    admin
  )
  assert.equal(billSummary(updated.visits[0]).total, 90000)
  assert.equal(
    updated.master.services.find((s) => s.id === "LAY-002").amount,
    80000
  )
})
test("payments, deposits, rejection, refunds and cancellation reconcile", () => {
  let state = served()
  state = payment(state, "Ditolak", 90000)
  assert.equal(billSummary(state.visits[0]).status, "Ditolak")
  assert.equal(billSummary(state.visits[0]).paid, 0)
  state = payment(state, "Pembayaran", 90000)
  assert.equal(billSummary(state.visits[0]).status, "Lunas")
  assert.throws(() => payment(state, "Refund", 90001))
  state = payment(state, "Refund", 90000)
  state = run(
    state,
    {
      type: "billing.cancel",
      id: state.visits[0].id,
      reason: "Koreksi administrasi",
    },
    cashier
  )
  assert.equal(billSummary(state.visits[0]).status, "Dibatalkan")
  assert.equal(state.visits[0].payments.length, 3)
  assert.throws(() => payment(state, "Pembayaran", 1))
  let deposit = payment(register(), "Deposit", 5000)
  assert.equal(billSummary(deposit.visits[0]).paid, 5000)
  assert.throws(() =>
    run(deposit, {
      type: "queue.transition",
      id: deposit.visits[0].id,
      status: "Dibatalkan",
      reason: "Uji",
    })
  )
  deposit = payment(deposit, "Refund", 5000)
  assert.equal(billSummary(deposit.visits[0]).paid, 0)
})
test("cashier rejects premature, excessive, negative and unauthorized payments", () => {
  assert.throws(() => payment(register(), "Pembayaran", 15000))
  const state = served()
  for (const value of [-1, 0, NaN, Infinity, 1.5, 90001])
    assert.throws(() => payment(state, "Pembayaran", value))
  assert.throws(() =>
    run(
      state,
      {
        type: "payment.record",
        id: state.visits[0].id,
        kind: "Pembayaran",
        amount: 90000,
        reason: "Uji",
      },
      registrar
    )
  )
  assert.throws(() =>
    run(
      state,
      { type: "master.tariff", id: "LAY-001", amount: 1, reason: "Uji" },
      doctor
    )
  )
})
test("operational report aggregates ledger values after refund", () => {
  let state = payment(served(), "Pembayaran", 90000)
  state = payment(state, "Refund", 10000)
  assert.deepEqual(operationalSummary(state), {
    patients: 1,
    visits: 1,
    waiting: 0,
    completed: 1,
    cancelled: 0,
    charges: 90000,
    received: 80000,
    outstanding: 10000,
  })
})
test("session and attempt isolation preserve role assignment, snapshot, audit and grades", () => {
  let state = transition(
    initialState,
    { type: "reset", reason: "Uji" },
    now,
    true
  )
  state = transition(
    state,
    { type: "login", role: "Mahasiswa", participantId: "MHS-DEMO-01" },
    now,
    true
  )
  state = transition(state, { type: "start" }, now, true)
  state = transition(
    state,
    {
      type: "core",
      sessionId: "SESI-001",
      attemptNumber: 2,
      command: {
        type: "registration.create",
        patient: patientSeed,
        unit: "Poli Umum",
        payer: "Umum",
        serviceId: "LAY-002",
        verified: true,
      },
    },
    now,
    true
  )
  state = transition(state, { type: "submit" }, now, true)
  state = transition(
    state,
    { type: "login", role: "Dosen", participantId: "MHS-DEMO-01" },
    now,
    true
  )
  const first = structuredClone(state)
  state = transition(
    state,
    { type: "select-session", id: "SESI-002" },
    now,
    true
  )
  assert.equal(state.attempt.visits.length, 0)
  assert.equal(state.participants[0].actor, "Petugas Rekam Medis")
  state = transition(
    state,
    { type: "reset", reason: "Reset sesi kedua" },
    now,
    true
  )
  assert.deepEqual(state.sessionData["SESI-001"].attempt, first.attempt)
  state = transition(
    state,
    { type: "select-session", id: "SESI-001" },
    now,
    true
  )
  assert.equal(state.attempt.visits.length, 1)
  assert.deepEqual(state.reviews, first.reviews)
  state = transition(
    state,
    { type: "reset", reason: "Reset sesi pertama" },
    now,
    true
  )
  assert.equal(state.history.at(-1).visits.length, 1)
  assert.deepEqual(state.reviews, first.reviews)
  assert.deepEqual(state.hospitalMaster, first.hospitalMaster)
  assert.equal(state.sessionData["SESI-002"].attempt.number, 2)
  assert.ok(state.audit.length > first.audit.length)
})
test("server denies anonymous, disabled, expired and forbidden URL access", () => {
  const server = new DemoServer(structuredClone(accounts))
  assert.throws(() => server.read(undefined))
  assert.throws(() => server.login("MHS-DEMO-07"))
  const login = server.login("MHS-DEMO-01", undefined, now)
  assert.throws(() => server.authorizePage(login.token, "penilaian", now))
  assert.throws(() => server.authorizePage(login.token, "simrs/kasir", now))
  assert.doesNotThrow(() =>
    server.authorizePage(login.token, "simrs/pendaftaran", now)
  )
  assert.throws(() => server.read(login.token, now + 9 * 3600000))
  server.directory.find((a) => a.id === "MHS-DEMO-01").active = false
  assert.throws(() => server.read(login.token, now))
})
test("server does not trust payload role/capability/state, stale versions or foreign scopes", () => {
  const server = new DemoServer()
  const login = server.login("MHS-DEMO-01", undefined, now),
    state = login.state
  const envelope = (action) => ({
    action,
    revision: state.revision,
    sessionId: state.activeSessionId,
    attemptNumber: state.attempt.number,
  })
  assert.throws(() =>
    server.mutate(
      login.token,
      envelope({ type: "reset", reason: "Hack", role: "Dosen" }),
      now
    )
  )
  assert.throws(() =>
    server.mutate(
      login.token,
      { ...envelope({ type: "start" }), sessionId: "SESI-002" },
      now
    )
  )
  const next = server.mutate(login.token, envelope({ type: "start" }), now)
  assert.throws(() =>
    server.mutate(login.token, envelope({ type: "start" }), now)
  )
  assert.ok(next.revision > state.revision)
  assert.throws(() =>
    server.mutate(
      login.token,
      {
        ...envelope({ type: "login", role: "Administrator" }),
        revision: next.revision,
      },
      now
    )
  )
})
test("separate browser environments never share transactions or assessments", () => {
  const server = new DemoServer()
  const a = server.login("DOSEN-DEMO", undefined, now),
    b = server.login("DOSEN-DEMO", undefined, now)
  const state = a.state
  server.mutate(
    a.token,
    {
      action: { type: "reset", reason: "Lingkungan A" },
      revision: state.revision,
      sessionId: state.activeSessionId,
      attemptNumber: state.attempt.number,
    },
    now
  )
  assert.equal(server.read(a.token, now).attempt.number, 2)
  assert.equal(server.read(b.token, now).attempt.number, 1)
  assert.notEqual(a.workspaceId, b.workspaceId)
})
test("new master tariff cannot silently rewrite a published scenario snapshot", () => {
  let state = transition(
    initialState,
    { type: "login", role: "Administrator", participantId: "MHS-DEMO-01" },
    now,
    true
  )
  state = transition(
    state,
    {
      type: "core",
      sessionId: state.activeSessionId,
      attemptNumber: 1,
      command: {
        type: "master.tariff",
        id: "LAY-002",
        amount: 81000,
        reason: "Tarif baru",
      },
    },
    now,
    true
  )
  assert.equal(
    state.hospitalMaster.services.find((s) => s.id === "LAY-002").amount,
    81000
  )
  assert.equal(
    state.scenarios[0].initialData.master.services.find(
      (s) => s.id === "LAY-002"
    ).amount,
    50000
  )
  assert.equal(
    state.attempt.core.master.services.find((s) => s.id === "LAY-002").amount,
    50000
  )
})
