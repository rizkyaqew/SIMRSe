import type { Account } from "./types"
/** Public, synthetic account directory for the local demo sign-in. No passwords or production identities. */
export const accounts: Account[] = [
  {
    id: "ADMIN-DEMO",
    name: "Administrator Demo",
    role: "Administrator",
    participantId: "MHS-DEMO-01",
    active: true,
  },
  {
    id: "DOSEN-DEMO",
    name: "Andi Pratama",
    role: "Dosen",
    participantId: "MHS-DEMO-01",
    active: true,
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `MHS-DEMO-0${i + 1}`,
    name: `Mahasiswa Demo 0${i + 1}`,
    role: "Mahasiswa" as const,
    participantId: `MHS-DEMO-0${i + 1}`,
    active: i < 6,
  })),
]
