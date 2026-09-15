"use client"
import { ActionLink, Notice, Panel, Status } from "@/components/platform/shared"
import { Button } from "@/components/ui/button"
import { useDemo } from "./provider"

/** Learning instructions stay outside the hospital transaction components. */
export function CoreTestingGuide() {
  const { state, refresh, pending } = useDemo()
  const actors = (actor: string) =>
    state.participants
      .filter((p) => p.actor === actor)
      .map((p) => `${p.name} (${p.id})`)
      .join(", ") || "Belum ditugaskan"
  return (
    <Panel
      title="Panduan uji alur dengan akun demo"
      description={`${state.activeSessionId} · Percobaan ${state.attempt.number}. Gunakan browser yang sama saat berpindah akun agar data tetap terhubung.`}
      action={
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => void refresh()}
        >
          Muat hasil terbaru
        </Button>
      }
    >
      <div className="page-stack">
        <Notice title="Ikuti urutan pelayanan yang sudah tersedia">
          Setiap akun mengisi bagiannya sesuai peran. Pergantian akun tidak
          mereset transaksi. Mulai dari briefing; bila data lama sudah terkunci,
          dosen dapat membuat sesi baru atau melakukan reset beralasan melalui
          menu sesi.
        </Notice>
        <ol className="task-list">
          <li>
            <strong>Administrator — siapkan master.</strong> Isi master rumah
            sakit. Jika memakai master baru, dosen membuat dan mempublikasikan
            skenario, membuat sesi baru, memilih sesi tersebut sebagai konteks
            aktif, lalu membuka sesi. Snapshot lama tetap utuh.
          </li>
          <li>
            <strong>
              Petugas Pendaftaran — {actors("Petugas Pendaftaran")}.
            </strong>{" "}
            Mulai/lanjutkan percobaan melalui briefing. Tambahkan pasien, atau
            isi pasien baru saat pendaftaran. Untuk appointment, simpan pasien →
            appointment → Daftarkan kunjungan. Verifikasi data, simpan, lalu
            panggil antrean.
          </li>
          <li>
            <strong>
              Petugas Rekam Medis — {actors("Petugas Rekam Medis")}.
            </strong>{" "}
            Periksa identitas dan kunjungan, lalu isi dokumentasi draft sesuai
            tugas.
          </li>
          <li>
            <strong>Dokter — {actors("Dokter")}.</strong> Verifikasi kunjungan →
            Mulai pelayanan → isi seluruh catatan/diagnosis/tindakan → Simpan
            rekam medis → Finalisasi → Selesaikan pelayanan.
          </li>
          <li>
            <strong>Kasir — {actors("Kasir")}.</strong> Pilih kunjungan yang
            sama; biaya berasal dari tindakan tersimpan. Isi pembayaran dummy
            dan alasan. Periksa status Lunas serta riwayat pembayaran; serahkan
            hasil melalui ruang simulasi setelah tugas selesai.
          </li>
          <li>
            <strong>Dosen — periksa hasil.</strong> Buka Laporan operasional,
            pilih kunjungan, telusuri status dan aktivitas, lalu unduh hasil.
            Gunakan monitor dan penilaian existing untuk observasi serta umpan
            balik.
          </li>
        </ol>
        <div className="row-actions">
          <Status>{state.attempt.status}</Status>
          <ActionLink href="/login">Ganti akun demo</ActionLink>
          {state.role === "Mahasiswa" && (
            <ActionLink href="/sesi-aktif">Buka briefing</ActionLink>
          )}
          {state.role === "Dosen" && (
            <>
              <ActionLink href="/monitor">Monitor aktivitas</ActionLink>
              <ActionLink href="/penilaian">Buka penilaian</ActionLink>
            </>
          )}
        </div>
      </div>
    </Panel>
  )
}
