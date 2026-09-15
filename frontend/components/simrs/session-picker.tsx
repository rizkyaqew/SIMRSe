"use client"
import { SelectControl } from "./ui"
import { useDemo } from "./provider"
export function SessionPicker() {
  const { state, dispatch, pending } = useDemo()
  return (
    <SelectControl
      label="Sesi praktikum aktif"
      options={state.sessions.map((s) => ({
        value: s.id,
        label: `${s.id} · ${s.title} · ${s.status}`,
      }))}
      value={state.activeSessionId}
      disabled={pending}
      onChange={(e) => {
        if (
          window.confirm(
            "Beralih sesi praktikum? Pastikan isian sudah disimpan. Transaksi dan riwayat sesi sebelumnya tetap tersedia."
          )
        )
          void dispatch({ type: "select-session", id: e.target.value })
      }}
    />
  )
}
