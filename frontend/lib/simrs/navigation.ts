import type { NavGroup, Role } from "./types"
const item = (path: string, label: string, description: string) => ({
  path,
  label,
  description,
})
/** Shared allowlist: hidden menu items and denied URLs use the same permissions. */
export const navigation: Record<Role, NavGroup[]> = {
  Administrator: [
    {
      label: "Administrasi",
      items: [
        item("pengguna", "Pengguna", "Akun dan hak akses pengguna"),
        item(
          "konfigurasi",
          "Konfigurasi akademik",
          "Periode, mata kuliah, dan kelas"
        ),
      ],
    },
    {
      label: "Rumah sakit",
      items: [
        item("master-data", "Master data", "Unit, SDM, layanan, dan tarif"),
      ],
    },
    {
      label: "Sistem",
      items: [
        item("audit", "Audit aktivitas", "Riwayat perubahan simulasi"),
        item(
          "pengaturan",
          "Pengaturan sistem",
          "Konfigurasi lingkungan simulasi"
        ),
      ],
    },
  ],
  Dosen: [
    {
      label: "Pembelajaran",
      items: [
        item("materi", "Materi", "Modul dan panduan pembelajaran"),
        item("peserta", "Daftar peserta", "Mahasiswa, kelas, dan kelompok"),
      ],
    },
    {
      label: "Praktikum",
      items: [
        item("skenario", "Skenario", "Rancang kasus dan tujuan pembelajaran"),
        item("sesi", "Sesi praktikum", "Jadwal dan pembagian peran"),
        item("monitor", "Monitor aktivitas", "Pantau progres dan audit sesi"),
      ],
    },
    {
      label: "Evaluasi",
      items: [
        item("observasi", "Catatan observasi", "Catat proses pembelajaran"),
        item("penilaian", "Penilaian", "Tinjau hasil dan beri umpan balik"),
      ],
    },
    {
      label: "Laporan & arsip",
      items: [
        item("laporan", "Laporan", "Ringkasan hasil praktikum"),
        item("arsip", "Arsip", "Skenario yang sudah diarsipkan"),
      ],
    },
  ],
  Mahasiswa: [
    {
      label: "Pembelajaran",
      items: [
        item("kelas", "Kelas", "Kelas dan kelompok Anda"),
        item("materi", "Materi", "Panduan sesuai tugas praktikum"),
      ],
    },
    {
      label: "Praktikum",
      items: [
        item("sesi-aktif", "Sesi aktif", "Briefing dan aturan sesi"),
        item("tugas", "Tugas", "Penugasan sesuai peran"),
        item("simulasi", "Simulasi", "Ruang kerja pelayanan rumah sakit"),
        item("transaksi", "Transaksi", "Riwayat kunjungan simulasi"),
      ],
    },
    {
      label: "Hasil belajar",
      items: [
        item("laporan", "Laporan", "Hasil dan riwayat percobaan"),
        item("umpan-balik", "Umpan balik", "Tinjauan yang dibuka oleh dosen"),
      ],
    },
  ],
}
export function canAccess(role: Role, path: string) {
  return (
    path === "" ||
    path === "bantuan" ||
    navigation[role].some((group) =>
      group.items.some((item) => item.path === path)
    )
  )
}
export const moduleInfo = Object.fromEntries(
  Object.values(navigation)
    .flatMap((groups) => groups.flatMap((group) => group.items))
    .map((item) => [item.path, item])
)
