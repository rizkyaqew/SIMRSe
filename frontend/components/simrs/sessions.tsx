"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Add01Icon, PlayIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { useDemo } from "./provider"
import { PageHeading, ParticipantTable, ActivityList } from "./dashboard"
import {
  ActionLink,
  Confirm,
  DataTable,
  FormField,
  Icon,
  Notice,
  Panel,
  SelectControl,
  Status,
} from "./ui"
import { academic, actors, actorTasks, formatDate } from "@/lib/simrs/data"
import { participant } from "@/lib/simrs/store"

export function Sessions({ monitor = false }: { monitor?: boolean }) {
  const { state, dispatch } = useDemo()
  const [create, setCreate] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [scenarioId, setScenarioId] = useState(
    state.scenarios.find((s) => s.status === "Dipublikasikan")?.id ?? ""
  )
  const [date, setDate] = useState("2026-09-17")
  const [time, setTime] = useState("08:00")
  const [message, setMessage] = useState("")
  const active = state.sessions[0]
  const locked =
    state.attempt.status !== "Belum dimulai" || active.status === "Ditutup"
  return (
    <div className="page-stack">
      <PageHeading
        title={monitor ? "Monitor aktivitas sesi" : "Sesi praktikum"}
        description="Kelola jadwal, pembagian peran, dan proses belajar mahasiswa."
        action={
          <Button onClick={() => setCreate(!create)}>
            <Icon icon={Add01Icon} />
            {create ? "Tutup formulir" : "Jadwalkan sesi"}
          </Button>
        }
      />
      {message && <Notice title={message} />}
      {create && (
        <Panel
          title="Jadwalkan sesi baru"
          description="Hanya skenario yang dipublikasikan dapat digunakan."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const scenario = state.scenarios.find((s) => s.id === scenarioId)
              if (!scenario || !date || !time) return
              dispatch({
                type: "session",
                session: {
                  id: `SESI-${Date.now()}`,
                  scenarioId,
                  title: scenario.title,
                  date,
                  time,
                  classroom: academic.classroom,
                  duration: scenario.duration,
                  status: "Terjadwal",
                },
              })
              setCreate(false)
              setMessage("Sesi baru berhasil dijadwalkan dalam demo.")
            }}
          >
            <FieldGroup className="form-grid">
              <FormField
                id="session-scenario"
                label="Skenario dipublikasikan"
                required
              >
                <SelectControl
                  id="session-scenario"
                  label="Skenario"
                  options={state.scenarios
                    .filter((s) => s.status === "Dipublikasikan")
                    .map((s) => s.id)}
                  value={scenarioId}
                  onChange={(e) => setScenarioId(e.target.value)}
                />
              </FormField>
              <FormField id="session-class" label="Kelas">
                <Input id="session-class" value={academic.classroom} readOnly />
              </FormField>
              <FormField id="session-date" label="Tanggal" required>
                <Input
                  id="session-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormField>
              <FormField id="session-time" label="Waktu (WIB)" required>
                <Input
                  id="session-time"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </FormField>
            </FieldGroup>
            <div className="form-actions">
              <Button type="submit" disabled={!scenarioId}>
                Simpan jadwal
              </Button>
            </div>
          </form>
        </Panel>
      )}
      <div className="workspace-grid">
        <div className="page-stack">
          <Panel
            title={active.title}
            description={`${active.id} · ${academic.classroom} · ${academic.group}`}
            action={<Status>{active.status}</Status>}
          >
            <div className="page-stack">
              <p>{state.scenarios[0].objective}</p>
              <div className="flex flex-wrap gap-3">
                <ActionLink href="/monitor">Pantau aktivitas</ActionLink>
                <Button
                  variant="outline"
                  disabled={active.status === "Ditutup"}
                  onClick={() =>
                    setConfirm(active.status === "Dijeda" ? "lanjut" : "jeda")
                  }
                >
                  {active.status === "Dijeda" ? "Lanjutkan sesi" : "Jeda sesi"}
                </Button>
                <Button
                  variant="outline"
                  disabled={active.status === "Ditutup"}
                  onClick={() => setConfirm("reset")}
                >
                  Ulangi percobaan
                </Button>
                <Button
                  variant="destructive"
                  disabled={active.status === "Ditutup"}
                  onClick={() => setConfirm("tutup")}
                >
                  Tutup sesi
                </Button>
              </div>
            </div>
          </Panel>
          <Panel
            title={
              monitor
                ? "Progres dan aktivitas peserta"
                : "Pembagian peran mahasiswa"
            }
            description={
              locked
                ? "Peran terkunci setelah percobaan dimulai atau sesi ditutup."
                : "Tetapkan peran sebelum mahasiswa memulai percobaan."
            }
          >
            {monitor ? (
              <ParticipantTable />
            ) : (
              <DataTable
                rows={state.participants}
                search={(p) => `${p.name} ${p.id} ${p.actor}`}
                placeholder="Cari peserta atau peran..."
                columns={[
                  {
                    label: "Mahasiswa",
                    render: (p) => (
                      <div>
                        <strong>{p.name}</strong>
                        <small className="block text-muted-foreground">
                          {p.id}
                        </small>
                      </div>
                    ),
                  },
                  {
                    label: "Peran rumah sakit",
                    render: (p) => (
                      <SelectControl
                        label={`Peran ${p.name}`}
                        options={actors}
                        value={p.actor}
                        disabled={locked}
                        onChange={(e) =>
                          dispatch({
                            type: "assign",
                            id: p.id,
                            actor: e.target.value as typeof p.actor,
                          })
                        }
                      />
                    ),
                  },
                  {
                    label: "Status",
                    render: () => <Status>Ditugaskan</Status>,
                  },
                ]}
              />
            )}
          </Panel>
          {monitor ? (
            <Panel title="Audit aktivitas sesi">
              <ActivityList all />
            </Panel>
          ) : (
            <Panel title="Jadwal praktikum">
              <DataTable
                rows={state.sessions}
                search={(s) => `${s.title} ${s.id}`}
                placeholder="Cari sesi praktikum..."
                columns={[
                  {
                    label: "Sesi",
                    render: (s) => (
                      <div>
                        <strong>{s.title}</strong>
                        <small className="block text-muted-foreground">
                          {s.id}
                        </small>
                      </div>
                    ),
                  },
                  {
                    label: "Jadwal",
                    render: (s) => (
                      <>
                        {formatDate(s.date)}
                        <small className="block">
                          {s.time} WIB · {s.duration} menit
                        </small>
                      </>
                    ),
                  },
                  {
                    label: "Status",
                    render: (s) => <Status>{s.status}</Status>,
                  },
                ]}
              />
            </Panel>
          )}
        </div>
        <div className="page-stack">
          <Panel title="Ringkasan sesi">
            <dl className="summary-list">
              <div>
                <dt>Periode</dt>
                <dd>
                  {academic.semester} {academic.year}
                </dd>
              </div>
              <div>
                <dt>Peserta</dt>
                <dd>{state.participants.length} mahasiswa · 6 peran</dd>
              </div>
              <div>
                <dt>Batas waktu</dt>
                <dd>{active.duration} menit per percobaan</dd>
              </div>
              <div>
                <dt>Percobaan kelompok</dt>
                <dd>Nomor {state.attempt.number}</dd>
              </div>
              <div>
                <dt>Kunjungan tercatat</dt>
                <dd>{state.attempt.visits.length} kunjungan</dd>
              </div>
            </dl>
          </Panel>
          <Notice title="Dampingi proses mahasiswa">
            Audit menyimpan pengguna, peran, waktu, serta perubahan data. Reset
            hanya memulai percobaan baru dan mempertahankan riwayat sebelumnya.
          </Notice>
        </div>
      </div>
      <Confirm
        open={!!confirm}
        onClose={() => setConfirm("")}
        requireReason
        title={
          {
            reset: "Ulangi percobaan kelompok?",
            tutup: "Tutup sesi praktikum?",
            jeda: "Jeda sesi praktikum?",
            lanjut: "Lanjutkan sesi praktikum?",
          }[confirm] ?? "Konfirmasi"
        }
        description={
          confirm === "reset"
            ? "Transaksi aktif dikembalikan ke kondisi awal. Master data, riwayat percobaan, penilaian, dan audit tetap disimpan. Nomor percobaan bertambah satu."
            : confirm === "tutup"
              ? "Seluruh peserta tidak dapat mengubah transaksi sesi ini lagi. Data tetap tersedia untuk ditinjau. Penutupan tidak dapat dibatalkan dalam demo."
              : "Status berlaku untuk semua peserta. Batas waktu tetap mengikuti waktu akhir percobaan."
        }
        onConfirm={(reason) => {
          if (confirm === "reset") dispatch({ type: "reset", reason })
          else
            dispatch({
              type: "session-status",
              status:
                confirm === "tutup"
                  ? "Ditutup"
                  : confirm === "jeda"
                    ? "Dijeda"
                    : "Sedang berjalan",
              reason,
            })
        }}
      />
    </div>
  )
}
export function Briefing({ tasksOnly = false }: { tasksOnly?: boolean }) {
  const { state, dispatch } = useDemo()
  const router = useRouter()
  const person = participant(state)
  const session = state.sessions[0]
  const scenario = state.scenarios.find((s) => s.id === session.scenarioId)!
  const started = state.attempt.status !== "Belum dimulai"
  return (
    <div className="page-stack">
      <PageHeading
        title={
          tasksOnly ? "Tugas praktikum Anda" : "Briefing praktikum mahasiswa"
        }
        description="Pahami skenario, kenali peran, dan mulai dengan siap."
      />
      <div className="workspace-grid">
        <div className="page-stack">
          <Panel
            title={scenario.title}
            description={`${session.id} · ${academic.course}`}
            action={<Status>{session.status}</Status>}
          >
            <div className="page-stack">
              <p>{scenario.context}</p>
              <dl className="detail-grid">
                <div>
                  <dt>Kelas / kelompok</dt>
                  <dd>
                    {academic.classroom} · {academic.group}
                  </dd>
                </div>
                <div>
                  <dt>Dosen pembimbing</dt>
                  <dd>Andi Pratama · akun demo</dd>
                </div>
                <div>
                  <dt>Tujuan pembelajaran</dt>
                  <dd>{scenario.objective}</dd>
                </div>
                <div>
                  <dt>Batas waktu</dt>
                  <dd>{session.duration} menit sejak percobaan dimulai</dd>
                </div>
              </dl>
            </div>
          </Panel>
          <Panel
            title="Tujuan dan tugas utama"
            description={`Penugasan Anda sebagai ${person.actor}.`}
          >
            <div className="page-stack">
              <ol className="task-list">
                {actorTasks[person.actor].map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ol>
              <Notice title="Aturan sesi">
                Gunakan data sintetis dari skenario. Bekerjalah sesuai peran,
                lakukan serah-terima informasi, lalu serahkan hasil. Transaksi
                yang diserahkan terkunci dan aktivitas dicatat untuk penilaian.
              </Notice>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={
                    session.status !== "Sedang berjalan" ||
                    state.submitted.includes(person.id)
                  }
                  onClick={() => {
                    if (!started) dispatch({ type: "start" })
                    router.push("/simulasi")
                  }}
                >
                  <Icon icon={PlayIcon} />
                  {started ? "Lanjutkan praktikum" : "Mulai praktikum"}
                </Button>
                <ActionLink href="/materi">Baca panduan peran</ActionLink>
              </div>
            </div>
          </Panel>
        </div>
        <div className="page-stack">
          <Panel title="Peran Anda">
            <div className="page-stack">
              <div className="scenario-visual">
                <Icon icon={PlayIcon} />
                <Status>Ditugaskan</Status>
              </div>
              <h3>{person.actor}</h3>
              <p>{person.name}</p>
              <p className="text-muted-foreground">
                Anda hanya dapat memproses tugas yang diizinkan untuk peran ini.
              </p>
            </div>
          </Panel>
          <Panel title="Status percobaan">
            <div className="page-stack">
              <Status>
                {state.submitted.includes(person.id)
                  ? "Submit"
                  : state.attempt.status}
              </Status>
              <Progress
                value={
                  state.submitted.includes(person.id)
                    ? 100
                    : state.attempt.visits.length
                      ? 75
                      : started
                        ? 25
                        : 0
                }
                aria-label="Progres percobaan Anda"
              />
              <p>
                Percobaan {state.attempt.number} · {state.attempt.visits.length}{" "}
                kunjungan kelompok
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
