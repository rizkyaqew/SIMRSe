import test from "node:test"
import assert from "node:assert/strict"
// Uses independent synthetic browser sessions; never reads or reuses a user's browser cookies.
const base = process.env.SIMRS_TEST_URL ?? "http://localhost:3000"
function client() {
  const jar = new Map()
  let state
  return {
    get state() {
      return state
    },
    async request(path, body, method = body ? "POST" : "GET", origin = base) {
      const response = await fetch(base + path, {
        method,
        redirect: "manual",
        headers: {
          ...(body
            ? { "Content-Type": "application/json", Origin: origin }
            : {}),
          Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      for (const value of response.headers.getSetCookie()) {
        const pair = value.split(";")[0],
          index = pair.indexOf("=")
        jar.set(pair.slice(0, index), pair.slice(index + 1))
      }
      const payload = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : null
      if (payload?.state) state = payload.state
      const html = payload ? "" : await response.text()
      return {
        status: response.status,
        payload,
        location: response.headers.get("location"),
        html,
      }
    },
    async login(accountId) {
      const result = await this.request("/api/auth", { accountId })
      assert.equal(result.status, 200, result.payload?.error)
      return state
    },
    async act(action, expected = 200, override = {}) {
      const result = await this.request("/api/workspace", {
        action,
        revision: state.revision,
        sessionId: state.activeSessionId,
        attemptNumber: state.attempt.number,
        ...override,
      })
      assert.equal(result.status, expected, result.payload?.error)
      return result
    },
  }
}
test("HTTP authentication, direct URL guards, disabled account and request origin", async () => {
  const c = client()
  assert.equal((await c.request("/api/workspace")).status, 401)
  const page = await c.request("/simrs/pendaftaran")
  // App Router can stream the parent layout before emitting its redirect instruction.
  assert.ok(
    page.status === 307
      ? page.location?.includes("/login")
      : page.status === 200 &&
          /NEXT_REDIRECT[^\n]*login|http-equiv="refresh"[^>]*login/.test(
            page.html
          )
  )
  assert.equal(
    (await c.request("/api/auth", { accountId: "MHS-DEMO-07" })).status,
    403
  )
  assert.equal(
    (
      await c.request(
        "/api/auth",
        { accountId: "DOSEN-DEMO" },
        "POST",
        "https://invalid.example"
      )
    ).status,
    403
  )
  await c.login("MHS-DEMO-01")
  assert.equal((await c.request("/api/workspace?path=penilaian")).status, 403)
  assert.equal((await c.request("/api/workspace?path=simrs/kasir")).status, 403)
  await c.request("/api/auth", {}, "DELETE")
  assert.equal((await c.request("/api/workspace")).status, 401)
})
test("HTTP integrated operational flow preserves learning, assessment, audit and isolated resets", async () => {
  const c = client()
  await c.login("DOSEN-DEMO")
  const originalMaster = structuredClone(c.state.master)
  await c.act({
    type: "scenario",
    scenario: {
      ...c.state.scenarios[0],
      id: "SK-HTTP",
      title: "Skenario uji integrasi HTTP",
      status: "Dipublikasikan",
    },
  })
  await c.act({
    type: "session",
    session: {
      ...c.state.sessions[1],
      id: "SESI-HTTP",
      scenarioId: "SK-HTTP",
      title: "Sesi uji HTTP",
    },
  })
  await c.act({
    type: "assign",
    id: "MHS-DEMO-01",
    actor: "Petugas Pendaftaran",
  })
  await c.act({ type: "reset", reason: "Uji alur lengkap" })
  await c.login("MHS-DEMO-01")
  await c.act({ type: "start" })
  const core = (command) => ({
    type: "core",
    command,
    sessionId: c.state.activeSessionId,
    attemptNumber: c.state.attempt.number,
  })
  await c.act(
    core({
      type: "registration.create",
      patient: {
        name: "Pasien Sintetis HTTP",
        identity: "SINT-8801",
        birthDate: "1995-01-01",
        gender: "Perempuan",
        address: "Alamat Sintetis Pengujian",
        payer: "Umum",
        unit: "Poli Umum",
      },
      unit: "Poli Umum",
      payer: "Umum",
      serviceId: "LAY-002",
      verified: true,
    })
  )
  const id = c.state.attempt.visits[0].id
  assert.equal(
    c.state.attempt.core.visits[0].charges.length,
    0,
    "Financial details must be redacted for registrar"
  )
  await c.act(core({ type: "queue.transition", id, status: "Dipanggil" }))
  await c.act(
    core({
      type: "payment.record",
      id,
      kind: "Pembayaran",
      amount: 65000,
      reason: "Tidak diizinkan",
    }),
    403
  )
  await c.login("MHS-DEMO-03")
  await c.act(core({ type: "visit.verify", id }))
  await c.act(core({ type: "queue.transition", id, status: "Dilayani" }))
  await c.act(
    core({
      type: "record.save",
      id,
      data: {
        ...c.state.attempt.core.visits[0].record.data,
        note: "Pelayanan sintetis HTTP",
        complaint: "Contoh keluhan",
        examination: "Pemeriksaan contoh",
        diagnosisId: "DX-DEMO-01",
      },
    })
  )
  await c.act(core({ type: "record.finalize", id }))
  await c.act(core({ type: "queue.transition", id, status: "Selesai" }))
  await c.login("MHS-DEMO-06")
  assert.equal(
    c.state.attempt.core.visits[0].record.data.note,
    "",
    "Clinical notes must be redacted for cashier"
  )
  assert.equal(
    c.state.attempt.core.visits[0].charges.reduce((n, r) => n + r.amount, 0),
    65000
  )
  await c.act(
    core({
      type: "payment.record",
      id,
      kind: "Pembayaran",
      amount: 65000,
      reason: "Pelunasan dummy HTTP",
    })
  )
  await c.act({ type: "submit" })
  await c.login("DOSEN-DEMO")
  const review = c.state.reviews.find(
    (r) => r.participantId === "MHS-DEMO-06" && r.attempt === 2
  )
  await c.act({
    type: "review",
    review: {
      ...review,
      comment: "Alur pelayanan dan pembayaran sesuai urutan.",
      status: "Dinilai",
      published: true,
    },
  })
  await c.act({
    type: "observe",
    text: "Serah-terima antarperan telah diperiksa melalui API.",
  })
  assert.ok(
    c.state.audit.some(
      (a) => a.feature === "Rekam medis" && a.before && a.after
    )
  )
  const auditCount = c.state.audit.length
  await c.login("MHS-DEMO-06")
  assert.ok(c.state.reviews.some((r) => r.comment.includes("sesuai urutan")))
  assert.ok(
    c.state.reviews.every(
      (r) => r.participantId === "MHS-DEMO-06" && r.published
    )
  )
  await c.login("DOSEN-DEMO")
  await c.act({ type: "select-session", id: "SESI-002" })
  assert.equal(c.state.attempt.visits.length, 0)
  await c.act({
    type: "session-status",
    status: "Sedang berjalan",
    reason: "Buka sesi kedua",
  })
  await c.act({ type: "reset", reason: "Ulangi sesi kedua" })
  await c.act({ type: "select-session", id: "SESI-001" })
  assert.equal(c.state.attempt.visits.length, 1)
  const stale = {
    revision: c.state.revision,
    sessionId: c.state.activeSessionId,
    attemptNumber: c.state.attempt.number,
  }
  await c.act({ type: "reset", reason: "Ulangi sesi pertama" })
  assert.equal(c.state.history.at(-1).visits.length, 1)
  assert.deepEqual(c.state.master, originalMaster)
  assert.ok(c.state.reviews.some((r) => r.published && r.attempt === 2))
  assert.ok(c.state.audit.length > auditCount)
  assert.equal(c.state.sessionData["SESI-002"].attempt.number, 2)
  await c.act({ type: "observe", text: "Permintaan lama" }, 409, stale)
  await c.act({
    type: "session-status",
    status: "Ditutup",
    reason: "Uji akhir sesi",
  })
  await c.login("MHS-DEMO-01")
  await c.act({ type: "start" }, 403)
})
