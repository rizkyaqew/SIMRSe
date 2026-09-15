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
