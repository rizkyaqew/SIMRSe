"use client"
import { useState } from "react"
import { CoreArea } from "./core-area"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { academic, materials } from "@/lib/simrs/data"
import { navigation } from "@/lib/simrs/navigation"
import type { Role } from "@/lib/simrs/types"
import { useDemo } from "./provider"
import { PageHeading } from "./dashboard"
import {
  ActionLink,
  DataTable,
  FormField,
  Notice,
  Panel,
  SelectControl,
  Status,
} from "./ui"

export function Login() {
  const { state, dispatch } = useDemo()
  const router = useRouter()
  const [role, setRole] = useState<Role>(state.role)
  const [person, setPerson] = useState(state.participantId)
  return (
    <div className="login-grid">
      <section className="login-hero">
        <h1>
          Belajar hari ini.
          <br />
          Melayani lebih baik
          <br />
          di masa depan.
        </h1>
        <p>
          Rasakan pengalaman mengelola administrasi rumah sakit dalam lingkungan
          praktikum yang aman, terarah, dan terintegrasi.
        </p>
        <Image
          src="/images/hospital-education.png"
          alt="Ilustrasi rumah sakit edukasi"
          width={2167}
          height={726}
          priority
        />
      </section>
      <Panel
        title="Masuk ke ruang pembelajaran"
        description="Pilih akun dan konteks praktikum untuk menjelajahi SIMRS-e."
        className="login-card"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (
              await dispatch({ type: "login", role, participantId: person })
            ) {
              router.push(role === "Mahasiswa" ? "/sesi-aktif" : "/")
              router.refresh()
            }
          }}
        >
          <Notice title="Akses demo Fase 1">
            Gunakan akun contoh tanpa kata sandi. Sesi akun diperiksa server.
            Data fiktif tersimpan sementara selama server demo berjalan.
          </Notice>
          <FieldGroup>
            <FormField id="login-role" label="Peran akun demo">
              <SelectControl
                id="login-role"
                label="Peran akun demo"
                options={["Dosen", "Mahasiswa", "Administrator"]}
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              />
            </FormField>
            {role === "Mahasiswa" && (
              <FormField id="login-person" label="Mahasiswa dan penugasan">
                <select
                  data-slot="native-select"
                  id="login-person"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                >
                  {state.participants.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name} · {p.actor}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <FormField id="login-period" label="Tahun ajaran / semester">
              <SelectControl
                id="login-period"
                label="Periode"
                options={[`${academic.year} · ${academic.semester}`]}
              />
            </FormField>
            <FormField
              id="login-session"
              label={
                role === "Mahasiswa" ? "Kelas / sesi ditugaskan" : "Kelas aktif"
              }
            >
              <SelectControl
                id="login-session"
                label="Kelas atau sesi"
                options={[
                  role === "Mahasiswa"
                    ? `${academic.classroom} · SESI-001 · Rawat jalan`
                    : `${academic.classroom} · ${academic.course}`,
                ]}
              />
            </FormField>
          </FieldGroup>
          <Button type="submit">Masuk sebagai {role}</Button>
        </form>
      </Panel>
    </div>
  )
}
export function MasterData() {
  return <CoreArea module="master" />
}
export function LearningMaterials() {
  const [selected, setSelected] = useState<(typeof materials)[number] | null>(
    null
  )
  return (
    <div className="page-stack">
      <PageHeading
        title="Materi pembelajaran"
        description="Pahami prosedur dan istilah sebelum menjalankan praktikum."
      />
      <Panel
        title={academic.course}
        description={`${academic.semester} ${academic.year} · ${academic.classroom}`}
      >
        <DataTable
          rows={materials}
          search={(m) => `${m.title} ${m.type}`}
          placeholder="Cari materi atau SOP..."
          columns={[
            {
              label: "Materi",
              render: (m) => (
                <div>
                  <strong>{m.title}</strong>
                  <small className="block text-muted-foreground">{m.id}</small>
                </div>
              ),
            },
            { label: "Jenis", render: (m) => <Status>{m.type}</Status> },
            { label: "Waktu baca", render: (m) => m.duration },
            {
              label: "Aksi",
              render: (m) => (
                <Button variant="outline" onClick={() => setSelected(m)}>
                  Baca materi
                </Button>
              ),
            },
          ]}
        />
      </Panel>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent className="simrs-ui">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {academic.course} · Materi demo
            </DialogDescription>
          </DialogHeader>
          <p className="leading-7">{selected?.content}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export function AcademicPage({ users = false }: { users?: boolean }) {
  const { state } = useDemo()
  return (
    <div className="page-stack">
      <PageHeading
        title={
          users
            ? "Pengguna dan hak akses"
            : state.role === "Mahasiswa"
              ? "Kelas saya"
              : "Kelas dan peserta"
        }
        description="Konteks akademik menghubungkan peserta dengan kegiatan praktikum."
      />
      <Panel title={academic.classroom} description={academic.course}>
        <dl className="detail-grid">
          <div>
            <dt>Tahun ajaran / semester</dt>
            <dd>
              {academic.year} · {academic.semester}
            </dd>
          </div>
          <div>
            <dt>Program studi</dt>
            <dd>Administrasi Rumah Sakit</dd>
          </div>
          <div>
            <dt>Kelompok praktikum</dt>
            <dd>{academic.group}</dd>
          </div>
          <div>
            <dt>Jumlah peserta</dt>
            <dd>{state.participants.length} mahasiswa</dd>
          </div>
        </dl>
      </Panel>
      <Panel
        title={users ? "Akun contoh" : "Anggota kelas"}
        description="Identitas mahasiswa dan petugas pada halaman ini seluruhnya sintetis."
      >
        <DataTable
          rows={
            users
              ? [
                  {
                    id: "DOS-DEMO",
                    name: "Dosen Demo",
                    actor: "Dosen",
                    status: "Aktif",
                  },
                  {
                    id: "ADM-DEMO",
                    name: "Administrator Demo",
                    actor: "Administrator",
                    status: "Aktif",
                  },
                  ...state.participants,
                ]
              : state.participants
          }
          search={(p) => `${p.name} ${p.id} ${p.actor}`}
          placeholder="Cari nama, identitas, atau peran..."
          columns={[
            { label: "Identitas demo", render: (p) => p.id },
            { label: "Nama", render: (p) => <strong>{p.name}</strong> },
            { label: "Peran / penugasan", render: (p) => p.actor },
            { label: "Status", render: (p) => <Status>{p.status}</Status> },
          ]}
        />
      </Panel>
      {users && (
        <Notice title="Pengelolaan akun demo">
          Akun dan keanggotaan tersedia untuk pratinjau. Pembuatan akun,
          perubahan hak akses, dan autentikasi permanen belum tersedia. Sesi
          akun demo dan izin tindakan sudah diperiksa oleh server.
        </Notice>
      )}
    </div>
  )
}
export function HelpPage({ settings = false }: { settings?: boolean }) {
  const { state } = useDemo()
  return (
    <div className="page-stack">
      <PageHeading
        title={settings ? "Pengaturan sistem" : "Pusat bantuan SIMRS-e"}
        description="Panduan penggunaan lingkungan pembelajaran administrasi rumah sakit."
      />
      <div className="workspace-grid">
        <div className="page-stack">
          <Panel
            title={
              settings
                ? "Lingkungan simulasi Fase 1"
                : "Mulai sesuai peran Anda"
            }
          >
            <div className="help-copy">
              <p>
                SIMRS-e menggunakan data sintetis untuk latihan. Administrator
                menyiapkan data dasar, dosen menyusun skenario dan sesi,
                mahasiswa memproses tugas sesuai peran.
              </p>
              <p>
                Dalam demo ini, pilih akun melalui menu profil. Setiap akun
                mahasiswa memiliki tugas pelayanan tersendiri. Perubahan tetap
                tersedia saat berpindah halaman dan memuat ulang browser.
                Lingkungan demo berakhir setelah 8 jam atau saat server dimulai
                ulang. Data setiap sesi praktikum disimpan terpisah.
              </p>
              <ActionLink href="/login">Pilih akun demo</ActionLink>
            </div>
          </Panel>
          <Panel title="Memahami alur praktikum">
            <ol className="task-list">
              <li>
                Baca briefing untuk memahami tujuan, data awal, penugasan, dan
                batas waktu.
              </li>
              <li>
                Mulai percobaan, lalu gunakan modul sesuai peran. Serahkan
                informasi ke peran berikutnya.
              </li>
              <li>
                Serahkan hasil setelah tugas selesai. Data terkunci untuk
                ditinjau dosen.
              </li>
              <li>
                Dosen menilai proses serta hasil. Pengulangan membuat nomor
                percobaan baru tanpa menghapus audit dan penilaian.
              </li>
            </ol>
          </Panel>
          <Panel title="Istilah yang perlu diketahui">
            <dl className="summary-list">
              <div>
                <dt>Skenario</dt>
                <dd>
                  Kasus, kondisi awal, tugas, dan hasil pembelajaran yang
                  diharapkan.
                </dd>
              </div>
              <div>
                <dt>Sesi</dt>
                <dd>Pelaksanaan skenario pada jadwal dan kelas tertentu.</dd>
              </div>
              <div>
                <dt>Nomor rekam medis / kunjungan</dt>
                <dd>
                  Nomor rekam medis mengenali pasien sintetis. Nomor kunjungan
                  mengenali satu episode pelayanan.
                </dd>
              </div>
              <div>
                <dt>Penjamin</dt>
                <dd>
                  Pihak yang menanggung biaya layanan dalam kasus simulasi.
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
        <div className="page-stack">
          <Panel title={`Akses ${state.role}`}>
            <ul className="flex flex-col gap-3">
              {navigation[state.role].map((g) => (
                <li key={g.label}>
                  <strong>{g.label}</strong>
                  <p className="text-muted-foreground">
                    {g.items.map((i) => i.label).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
          <Notice title="Data pembelajaran">
            Tidak ada data pasien nyata, pembayaran nyata, integrasi produksi,
            atau rekomendasi klinis otomatis.
          </Notice>
        </div>
      </div>
    </div>
  )
}
