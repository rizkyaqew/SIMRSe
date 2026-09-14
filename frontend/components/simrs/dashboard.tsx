"use client"
import Image from "next/image"
import Link from "next/link"
import {
  Add01Icon,
  UserGroupIcon,
  PlayIcon,
  File01Icon,
  Clock01Icon,
  Calendar03Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { useDemo } from "./provider"
import {
  ActionLink,
  Icon,
  Panel,
  Status,
  SelectControl,
  EmptyState,
} from "./ui"
import { academic, formatDate, formatTime } from "@/lib/simrs/data"
import { participant } from "@/lib/simrs/store"

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}
export function ParticipantTable({ compact = false }: { compact?: boolean }) {
  const { state } = useDemo()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama peserta</TableHead>
          <TableHead>Peran</TableHead>
          <TableHead>Progres</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {state.participants.slice(0, compact ? 3 : undefined).map((p, i) => (
          <TableRow key={p.id}>
            <TableCell>
              <div className="person-cell">
                <Avatar size="sm">
                  <AvatarFallback>M{i + 1}</AvatarFallback>
                </Avatar>
                <span>
                  {p.name}
                  <small>{p.id}</small>
                </span>
              </div>
            </TableCell>
            <TableCell>{p.actor}</TableCell>
            <TableCell>
              <div className="progress-cell">
                <Progress value={p.progress} aria-label={`Progres ${p.name}`} />
                <span>{p.progress}%</span>
              </div>
            </TableCell>
            <TableCell>
              <Status>
                {state.submitted.includes(p.id) ? "Submit" : p.status}
              </Status>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
export function ActivityList({ all = false }: { all?: boolean }) {
  const { state } = useDemo()
  const entries = state.audit.filter(
    (a) => state.role !== "Mahasiswa" || a.user === participant(state).name
  )
  return (
    <div className="activity-list">
      {entries.slice(0, all ? 12 : 3).map((a) => (
        <div className="activity-item" key={a.id}>
          <span className="activity-icon">
            <Icon icon={File01Icon} />
          </span>
          <div>
            <strong>{a.action}</strong>
            <p>{a.user}</p>
            <small>
              {a.session} · Percobaan {a.attempt}
            </small>
          </div>
          <time>
            {formatTime(a.time)}
            <small>WIB</small>
          </time>
        </div>
      ))}
      {!entries.length && (
        <EmptyState
          title="Belum ada aktivitas"
          description="Aktivitas akan tercatat saat Anda mulai bekerja."
        />
      )}
    </div>
  )
}
export function Dashboard() {
  const { state } = useDemo()
  const teacher = state.role === "Dosen"
  const admin = state.role === "Administrator"
  const stats = admin
    ? [
        {
          label: "Pengguna demo",
          value: state.participants.length + 2,
          icon: UserGroupIcon,
        },
        { label: "Kelas tersedia", value: 1, icon: Calendar03Icon },
        { label: "Data master", value: state.master.length, icon: File01Icon },
        {
          label: "Sesi praktikum",
          value: state.sessions.length,
          icon: PlayIcon,
        },
      ]
    : teacher
      ? [
          {
            label: "Peserta aktif",
            value: state.participants.length,
            icon: UserGroupIcon,
          },
          {
            label: "Sesi berjalan",
            value: state.sessions.filter((s) => s.status === "Sedang berjalan")
              .length,
            icon: PlayIcon,
          },
          {
            label: "Skenario tersedia",
            value: state.scenarios.length,
            icon: File01Icon,
          },
          {
            label: "Menunggu penilaian",
            value: state.reviews.filter(
              (r) => r.status === "Menunggu penilaian"
            ).length,
            icon: Clock01Icon,
          },
        ]
      : [
          { label: "Kelas diikuti", value: 1, icon: UserGroupIcon },
          { label: "Sesi ditugaskan", value: 1, icon: PlayIcon },
          {
            label: "Percobaan saat ini",
            value: state.attempt.number,
            icon: File01Icon,
          },
          {
            label: "Kunjungan kelompok",
            value: state.attempt.visits.length,
            icon: Clock01Icon,
          },
        ]
  return (
    <div className="page-stack">
      <PageHeading
        title={
          teacher
            ? "Selamat datang, Pak Andi"
            : admin
              ? "Beranda administrator"
              : "Selamat belajar, Mahasiswa"
        }
        description={
          teacher
            ? "Pantau praktikum, dampingi proses, dan tumbuhkan kompetensi mahasiswa."
            : admin
              ? "Siapkan lingkungan rumah sakit simulasi untuk pembelajaran yang terarah."
              : "Pahami tugas Anda dan lanjutkan pengalaman praktikum hari ini."
        }
        action={
          <SelectControl
            label="Periode aktif"
            options={[`${academic.semester} ${academic.year} · ARS`]}
          />
        }
      />
      <section className="welcome-banner">
        <div className="welcome-copy">
          <h2>
            Ruang belajar.
            <br className="mobile-break" /> Pengalaman nyata.
          </h2>
          <p>
            Bangun ketelitian dan pemahaman alur administrasi rumah sakit
            melalui praktikum yang terintegrasi.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              role="link"
              render={
                <Link
                  href={
                    teacher
                      ? "/skenario?buat=1"
                      : admin
                        ? "/master-data"
                        : "/sesi-aktif"
                  }
                />
              }
            >
              <Icon
                icon={teacher ? Add01Icon : PlayIcon}
                data-icon="inline-start"
              />
              {teacher
                ? "Buat skenario"
                : admin
                  ? "Kelola master data"
                  : "Buka briefing praktikum"}
            </Button>
            <ActionLink
              href={teacher ? "/sesi" : admin ? "/konfigurasi" : "/tugas"}
            >
              {teacher
                ? "Lihat sesi praktikum"
                : admin
                  ? "Konfigurasi akademik"
                  : "Lihat tugas saya"}
            </ActionLink>
          </div>
        </div>
        <Image
          className="hospital-art"
          src="/images/hospital-education.png"
          alt=""
          width={2167}
          height={726}
          priority
        />
      </section>
      <Card className="statistics">
        <CardContent>
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <span className="stat-icon">
                <Icon icon={stat.icon} />
              </span>
              <div>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="dashboard-grid">
        <div className="page-stack">
          <Panel
            title={admin ? "Kesiapan lingkungan simulasi" : "Sesi praktikum"}
            description={
              admin
                ? "Master data dan konteks akademik untuk Fase 1."
                : "Terhubung dengan kelas dan tujuan pembelajaran Anda."
            }
            action={
              <Button
                variant="link"
                nativeButton={false}
                role="link"
                render={
                  <Link
                    href={
                      admin ? "/master-data" : teacher ? "/sesi" : "/sesi-aktif"
                    }
                  />
                }
              >
                Lihat semua
                <Icon icon={ArrowRight01Icon} />
              </Button>
            }
          >
            {admin ? (
              <div className="readiness-list">
                {[
                  "Struktur unit & poli",
                  "SDM & jadwal pelayanan",
                  "Layanan & tarif simulasi",
                  "Kelas, kelompok & periode",
                ].map((name) => (
                  <div key={name}>
                    <span>{name}</span>
                    <Status>Aktif</Status>
                  </div>
                ))}
              </div>
            ) : (
              <div className="session-list">
                {state.sessions.slice(0, teacher ? 2 : 1).map((session, i) => (
                  <div className="session-row" key={session.id}>
                    <div className="session-row-title">
                      <span className="session-symbol">
                        <Icon icon={PlayIcon} />
                      </span>
                      <div>
                        <Link href={teacher ? "/sesi" : "/sesi-aktif"}>
                          <h3>{session.title}</h3>
                        </Link>
                        <p>
                          {session.id} · {session.classroom} · {academic.group}
                        </p>
                      </div>
                      <Status>{session.status}</Status>
                    </div>
                    <div className="session-row-bottom">
                      <span>
                        <Icon icon={Calendar03Icon} />
                        {formatDate(session.date)} · {session.time} WIB
                      </span>
                      <span>
                        <Icon icon={UserGroupIcon} />
                        {state.participants.length} peserta
                      </span>
                      <ActionLink
                        href={
                          teacher ? (i ? "/sesi" : "/monitor") : "/sesi-aktif"
                        }
                      >
                        {teacher
                          ? i
                            ? "Detail sesi"
                            : "Monitor sesi"
                          : "Lanjutkan"}
                      </ActionLink>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          {teacher ? (
            <Panel
              title="Progres peserta"
              description="Ringkasan progres peserta pada data contoh sesi aktif."
              action={
                <Button
                  variant="link"
                  nativeButton={false}
                  role="link"
                  render={<Link href="/peserta" />}
                >
                  Lihat semua
                  <Icon icon={ArrowRight01Icon} />
                </Button>
              }
            >
              <ParticipantTable compact />
            </Panel>
          ) : (
            <Panel
              title={admin ? "Konfigurasi akademik" : "Konteks praktikum Anda"}
            >
              <dl className="detail-grid">
                <div>
                  <dt>Mata kuliah</dt>
                  <dd>{academic.course}</dd>
                </div>
                <div>
                  <dt>Tahun ajaran</dt>
                  <dd>
                    {academic.year} · {academic.semester}
                  </dd>
                </div>
                <div>
                  <dt>Kelas / kelompok</dt>
                  <dd>
                    {academic.classroom} · {academic.group}
                  </dd>
                </div>
                <div>
                  <dt>{admin ? "Rumah sakit" : "Peran saat ini"}</dt>
                  <dd>
                    {admin ? academic.hospital : participant(state).actor}
                  </dd>
                </div>
              </dl>
            </Panel>
          )}
        </div>
        <div className="page-stack">
          <Panel
            title="Aktivitas terbaru"
            description="Jejak proses dalam lingkungan simulasi."
          >
            <ActivityList />
          </Panel>
          <Panel title={teacher ? "Perlu perhatian" : "Panduan untuk Anda"}>
            {teacher ? (
              <div className="attention-list">
                {state.reviews
                  .filter((r) => r.status === "Menunggu penilaian")
                  .slice(0, 2)
                  .map((r) => (
                    <div key={r.participantId}>
                      <span className="attention-icon">
                        <Icon icon={File01Icon} />
                      </span>
                      <div>
                        <strong>Hasil menunggu ditinjau</strong>
                        <p>
                          {
                            state.participants.find(
                              (p) => p.id === r.participantId
                            )?.name
                          }
                        </p>
                      </div>
                      <Button
                        variant="link"
                        nativeButton={false}
                        role="link"
                        render={<Link href="/penilaian" />}
                      >
                        Tinjau
                      </Button>
                    </div>
                  ))}
                {!state.reviews.some(
                  (r) => r.status === "Menunggu penilaian"
                ) && <p>Semua hasil telah ditinjau.</p>}
              </div>
            ) : (
              <div className="help-copy">
                <h3>
                  {admin
                    ? "Siapkan data dengan konsisten"
                    : "Setiap peran punya kontribusi"}
                </h3>
                <p>
                  {admin
                    ? "Pisahkan master data dari hasil percobaan. Data simulasi ini tidak terhubung ke rumah sakit produksi."
                    : "Baca briefing, pahami batas tugas, dan serahkan informasi yang lengkap kepada peran selanjutnya."}
                </p>
                <ActionLink href="/bantuan">Buka pusat bantuan</ActionLink>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
