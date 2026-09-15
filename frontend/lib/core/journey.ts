import { billSummary } from "./engine"
import { formatDate, formatTime, rupiah } from "../platform/format"
import type { CoreModule } from "./navigation"
import type { CoreState, Visit } from "./types"
import type { Principal } from "../platform/types"

export interface JourneyStep {
  title: string
  status: string
  detail: string
  module: CoreModule
}
/** Read-only projection of persisted hospital facts; no independent workflow state. */
export function visitJourney(
  visit: Visit,
  principal: Principal
): JourneyStep[] {
  const cancelled = ["Dibatalkan", "Tidak datang"].includes(visit.status)
  const financial = principal.capabilities.includes("billing.read")
  const bill = financial ? billSummary(visit) : null
  return [
    {
      title: "Pendaftaran",
      status: "Selesai",
      detail: `${visit.id} · ${visit.queue} · ${visit.unit} · ${visit.payer}`,
      module: "pendaftaran",
    },
    {
      title: "Antrean",
      status: visit.status,
      detail: cancelled
        ? visit.cancelReason
        : visit.status === "Menunggu"
          ? "Petugas memanggil pasien sebelum pelayanan."
          : "Pemanggilan dan status pelayanan tercatat.",
      module: "antrean",
    },
    {
      title: "Verifikasi unit",
      status: visit.verified
        ? "Selesai"
        : cancelled
          ? "Dihentikan"
          : "Menunggu",
      detail: visit.verified
        ? "Identitas kunjungan telah diverifikasi di unit pelayanan."
        : "Dokter / petugas rekam medis memeriksa kunjungan.",
      module: "rawat-jalan",
    },
    {
      title: "Rekam medis",
      status: visit.record.finalized
        ? "Final"
        : cancelled
          ? "Dihentikan"
          : "Draft",
      detail: visit.record.finalized
        ? "Catatan final tersimpan; perubahan melalui koreksi beralasan."
        : "Isi catatan, simpan, lalu dokter melakukan finalisasi saat Dilayani.",
      module: "rekam-medis",
    },
    {
      title: "Penyelesaian pelayanan",
      status:
        visit.status === "Selesai"
          ? "Selesai"
          : cancelled
            ? "Dihentikan"
            : "Menunggu",
      detail: "Pelayanan selesai membentuk biaya layanan dan tindakan aktual.",
      module: "rawat-jalan",
    },
    {
      title: "Billing & pembayaran",
      status: bill ? bill.status : "Sesuai akses",
      detail: bill
        ? `Tagihan Rp${bill.total.toLocaleString("id-ID")} · dibayar Rp${bill.paid.toLocaleString("id-ID")} · sisa Rp${bill.due.toLocaleString("id-ID")}`
        : "Rincian transaksi tersedia bagi akun dengan akses billing.",
      module: "kasir",
    },
  ]
}
export function journeyText(
  data: CoreState,
  visit: Visit,
  principal: Principal
) {
  const patient = data.patients.find((p) => p.id === visit.patientId)
  const appointment = data.appointments.find(
    (a) => a.id === visit.appointmentId
  )
  const lines = [
    "DOKUMEN SIMULASI — PENELUSURAN KUNJUNGAN",
    "DATA SINTETIS",
    data.master.hospital,
    `${patient?.rm} · ${patient?.name}`,
    `Identitas: ${patient?.identity}`,
    `Tanggal lahir: ${patient ? formatDate(patient.birthDate) : "—"} · ${patient?.gender}`,
    `Alamat sintetis: ${patient?.address}`,
    `Kontak sintetis: ${patient?.contact || "Belum dicatat"}`,
    `${visit.id} · antrean ${visit.queue}`,
    `Kedatangan: ${visit.arrival}${appointment ? ` · ${appointment.id} · ${formatDate(appointment.date)} ${appointment.time} WIB` : ""}`,
    `Layanan: ${data.master.services.find((s) => s.id === visit.serviceId)?.name ?? visit.serviceId}`,
    `Terakhir tersimpan: ${formatDate(visit.savedAt)} ${formatTime(visit.savedAt)} WIB`,
    ...visitJourney(visit, principal).map(
      (s, i) => `${i + 1}. ${s.title}: ${s.status}\n${s.detail}`
    ),
  ]
  if (
    principal.capabilities.some(
      (c) => c === "record.read" || c === "record.write"
    )
  ) {
    lines.push(
      "REKAM MEDIS",
      `Keluhan: ${visit.record.data.complaint}`,
      `Pemeriksaan: ${visit.record.data.examination}`,
      `Diagnosis: ${visit.record.data.diagnosisId} · ${data.master.diagnoses.find((d) => d.id === visit.record.data.diagnosisId)?.name ?? "Belum dicatat"}`,
      `Tindakan: ${visit.record.data.procedureIds.map((id) => `${id} · ${data.master.services.find((s) => s.id === id)?.name ?? id}`).join(", ") || "Tidak ada"}`,
      `Catatan: ${visit.record.data.note}`,
      `Hasil: ${visit.record.data.result}`,
      `Tindak lanjut: ${visit.record.data.followUp}`,
      `Rujukan: ${visit.record.data.referral}`,
      `Versi tersimpan: ${visit.record.versions.length}`
    )
  }
  if (principal.capabilities.includes("billing.read")) {
    lines.push(
      "RINCIAN BIAYA",
      ...visit.charges.map(
        (c) =>
          `${c.name}: ${c.quantity} × ${rupiah(c.amount)} · ${c.cancelled ? `Batal: ${c.reason}` : "Dibebankan"}`
      ),
      "RIWAYAT PEMBAYARAN DUMMY",
      ...visit.payments.map(
        (p) =>
          `${formatDate(p.time)} ${formatTime(p.time)} WIB · ${p.kind} · ${rupiah(p.amount)} · ${p.reason}`
      )
    )
  }
  return lines.join("\n")
}
