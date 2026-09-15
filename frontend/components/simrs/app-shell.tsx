"use client"
import { canReadCore } from "@/lib/platform/core-access"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowDown01Icon,
  Home01Icon,
  HelpCircleIcon,
  Notification02Icon,
  BookOpen01Icon,
  Clock01Icon,
  Logout01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useDemo } from "./provider"
import { ActionLink, EmptyState, Icon, Status } from "./ui"
import { canAccess, moduleInfo, navigation } from "@/lib/simrs/navigation"
import { formatTime } from "@/lib/simrs/data"
import { participant } from "@/lib/simrs/store"
import { coreGroups, coreModules, type CoreModule } from "@/lib/core/navigation"

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="SIMRS-e Beranda">
      <span className="brand-cross" aria-hidden="true">
        <i />
        <i />
      </span>
      <span>
        SIMRS<span className="brand-e">-e</span>
      </span>
    </Link>
  )
}
function SessionBar() {
  const { state } = useDemo()
  const [now, setNow] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const seconds =
    state.attempt.deadline && now
      ? Math.max(0, Math.floor((state.attempt.deadline - now) / 1000))
      : state.sessions[0].duration * 60
  return (
    <div className="session-context">
      <div className="shell-width session-context-inner">
        <div>
          <Status>{state.sessions[0].status}</Status>
          <strong>{state.sessions[0].title}</strong>
          <span className="context-small">
            {state.sessions[0].id} · Percobaan {state.attempt.number}
          </span>
        </div>
        <div>
          <Icon icon={Clock01Icon} />
          <strong className="tabular-nums">
            {Math.floor(seconds / 60)
              .toString()
              .padStart(2, "0")}
            :{(seconds % 60).toString().padStart(2, "0")}
          </strong>
          <span className="context-small">
            {state.role === "Dosen"
              ? "Observasi dosen"
              : participant(state).actor}
          </span>
          <ActionLink href={state.role === "Dosen" ? "/monitor" : "/tugas"}>
            {state.role === "Dosen" ? "Monitor sesi" : "Lihat tugas"}
          </ActionLink>
        </div>
      </div>
    </div>
  )
}
export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useDemo()
  const path = usePathname()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const slug = path.split("/")[1] ?? ""
  const core = slug === "simrs"
  const selectedPath = core ? path.slice(1) : slug
  const groups = core
    ? coreGroups
        .map((group) => ({
          label: group.label,
          items: group.items
            .filter((item) =>
              canReadCore(state.role, participant(state).actor, item)
            )
            .map((item) => ({
              path: `simrs/${item}`,
              label: coreModules[item],
              description: "SIMRS Inti · data sintetis",
            })),
        }))
        .filter((group) => group.items.length)
    : navigation[state.role]
  const login = slug === "login"
  const person =
    state.role === "Mahasiswa"
      ? participant(state).name
      : state.role === "Dosen"
        ? "Andi Pratama"
        : "Administrator Demo"
  const initials =
    state.role === "Mahasiswa"
      ? "M" + state.participantId.slice(-1)
      : state.role === "Dosen"
        ? "AP"
        : "AD"
  const permitted = !moduleInfo[slug] || canAccess(state.role, slug)
  return (
    <div className="simrs-ui app-shell">
      <a className="skip-link" href="#main-content">
        Lewati navigasi
      </a>
      <header className="app-header">
        <div className="shell-width header-inner">
          <div className="brand-area">
            <Brand />
            <span className="brand-description">
              Sistem Informasi Manajemen
              <br />
              Rumah Sakit Edukasi
            </span>
          </div>
          <div className="header-actions">
            <Button
              variant="ghost"
              nativeButton={false}
              role="link"
              render={<Link href="/bantuan" />}
            >
              <Icon icon={HelpCircleIcon} />
              <span className="help-label">Pusat bantuan</span>
            </Button>
            {state.signedIn && !login && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Notifikasi"
                      />
                    }
                  >
                    <Icon icon={Notification02Icon} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="simrs-ui notification-menu"
                    align="end"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>
                        Aktivitas terbaru · data demo
                      </DropdownMenuLabel>
                      {state.audit
                        .filter(
                          (a) => state.role !== "Mahasiswa" || a.user === person
                        )
                        .slice(0, 3)
                        .map((a) => (
                          <DropdownMenuItem
                            key={a.id}
                            onClick={() =>
                              router.push(
                                state.role === "Administrator"
                                  ? "/audit"
                                  : state.role === "Dosen"
                                    ? "/monitor"
                                    : "/transaksi"
                              )
                            }
                          >
                            <div>
                              <strong>{a.action}</strong>
                              <small>
                                {formatTime(a.time)} WIB · {a.user}
                              </small>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      {state.role === "Mahasiswa" &&
                        !state.audit.some((a) => a.user === person) && (
                          <DropdownMenuItem disabled>
                            Belum ada aktivitas untuk akun ini.
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="header-divider" />
                <DropdownMenu>
                  <DropdownMenuTrigger className="account-trigger">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="account-name">
                      <strong>{person}</strong>
                      <small>{state.role}</small>
                    </span>
                    <Icon icon={ArrowDown01Icon} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="simrs-ui account-menu"
                    align="end"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>
                        Akun demo · {state.role}
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          setTheme(resolvedTheme === "dark" ? "light" : "dark")
                        }
                      >
                        <Icon icon={Settings01Icon} />
                        Ganti tema terang / gelap
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        nativeButton={false}
                        render={<Link href="/login" />}
                      >
                        <Icon icon={Home01Icon} />
                        Pilih akun demo
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={async () => {
                          if (await dispatch({ type: "logout" }))
                            router.push("/login")
                        }}
                      >
                        <Icon icon={Logout01Icon} />
                        Keluar
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
        {!login && state.signedIn && (
          <div
            className="shell-width workspace-switcher"
            aria-label="Area platform"
          >
            <Link href="/" aria-current={!core ? "page" : undefined}>
              Simulasi & pembelajaran
            </Link>
            <Link href="/simrs" aria-current={core ? "page" : undefined}>
              SIMRS Inti
            </Link>
          </div>
        )}
        {!login && state.signedIn && (
          <div className="nav-border">
            <nav
              className="shell-width top-navigation"
              aria-label="Navigasi utama"
            >
              <Link
                className="nav-home"
                data-active={core ? path === "/simrs" : slug === ""}
                aria-current={
                  (core ? path === "/simrs" : slug === "") ? "page" : undefined
                }
                href={core ? "/simrs" : "/"}
              >
                <Icon icon={Home01Icon} />
                {core ? "Operasional" : "Beranda"}
              </Link>
              {groups.map((group) => (
                <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger
                    className="nav-trigger"
                    data-active={group.items.some(
                      (item) => item.path === selectedPath
                    )}
                  >
                    {group.label}
                    <Icon icon={ArrowDown01Icon} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="simrs-ui navigation-popup"
                    sideOffset={8}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                      {group.items.map((item) => (
                        <DropdownMenuItem
                          key={item.path}
                          nativeButton={false}
                          render={<Link href={`/${item.path}`} />}
                          aria-current={
                            item.path === selectedPath ? "page" : undefined
                          }
                        >
                          <div>
                            <strong>{item.label}</strong>
                            <small>{item.description}</small>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
              <div className="nav-simulation">
                <Badge className="simulation-badge" variant="secondary">
                  SIMULASI
                </Badge>
                <span>Data sintetis</span>
              </div>
            </nav>
          </div>
        )}
      </header>
      {state.signedIn &&
        !login &&
        (state.role === "Mahasiswa" || (core && state.role === "Dosen")) && (
          <SessionBar />
        )}
      <main id="main-content" className="shell-width main-content">
        {!login && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="breadcrumb-home">
              <Icon icon={Home01Icon} />
              Beranda
            </Link>
            {slug && (
              <>
                <span>/</span>
                <span aria-current="page">
                  {(core
                    ? coreModules[
                        (path.split("/")[2] || "ringkasan") as CoreModule
                      ]
                    : moduleInfo[slug]?.label) ??
                    (slug === "bantuan"
                      ? "Pusat bantuan"
                      : "Halaman tidak ditemukan")}
                </span>
              </>
            )}
          </nav>
        )}
        {!state.signedIn && !login && slug !== "bantuan" ? (
          <EmptyState
            title="Silakan masuk"
            description="Pilih akun demo untuk membuka ruang belajar sesuai peran Anda."
            action={
              <ActionLink href="/login" primary>
                Masuk ke SIMRS-e
              </ActionLink>
            }
          />
        ) : !permitted && !login ? (
          <EmptyState
            title="Akses tidak diizinkan"
            description={`Halaman ini tidak tersedia untuk peran ${state.role}. Pilih menu yang sesuai dengan penugasan Anda.`}
            action={<ActionLink href="/">Kembali ke beranda</ActionLink>}
          />
        ) : (
          <div
            key={`${state.role}-${state.participantId}-${state.activeSessionId}-${state.attempt.number}`}
          >
            {children}
          </div>
        )}
      </main>
      {!login && (
        <footer className="shell-width app-footer">
          <div className="guide-band">
            <div>
              <Icon icon={BookOpen01Icon} />
              <span>
                <strong>Panduan praktikum</strong>
                <small>Belajar melalui proses yang terarah.</small>
              </span>
            </div>
            {["Pahami skenario", "Jalankan peran", "Tinjau hasil"].map(
              (text, i) => (
                <div key={text}>
                  <span className="step-number">{i + 1}</span>
                  <span>
                    <strong>{text}</strong>
                    <small>
                      {
                        [
                          "Baca tujuan dan aturan sesi.",
                          "Catat proses dengan teliti.",
                          "Pelajari hasil dan umpan balik.",
                        ][i]
                      }
                    </small>
                  </span>
                </div>
              )
            )}
          </div>
          <div className="footer-note">
            <span>© 2026 SIMRS-e · Lingkungan pembelajaran</span>
            <span>
              Demo lokal · Data tersimpan sementara selama server berjalan
            </span>
          </div>
        </footer>
      )}
    </div>
  )
}
