"use client"
import {
  AcademicPage,
  HelpPage,
  LearningMaterials,
  Login,
  MasterData,
} from "./catalogs"
import { Audit, Evaluation, Observations, Reports } from "./evaluation"
import { Scenarios } from "./scenarios"
import { Briefing, Sessions } from "./sessions"
import { Simulation } from "./simulation"
export function ModulePage({ module }: { module: string }) {
  switch (module) {
    case "login":
      return <Login />
    case "skenario":
      return <Scenarios />
    case "arsip":
      return <Scenarios archive />
    case "sesi":
      return <Sessions />
    case "monitor":
      return <Sessions monitor />
    case "sesi-aktif":
      return <Briefing />
    case "tugas":
      return <Briefing tasksOnly />
    case "simulasi":
      return <Simulation />
    case "transaksi":
      return <Simulation transactions />
    case "master-data":
      return <MasterData />
    case "materi":
      return <LearningMaterials />
    case "pengguna":
      return <AcademicPage users />
    case "konfigurasi":
    case "peserta":
    case "kelas":
      return <AcademicPage />
    case "penilaian":
      return <Evaluation />
    case "umpan-balik":
      return <Evaluation feedback />
    case "observasi":
      return <Observations />
    case "audit":
      return <Audit />
    case "laporan":
      return <Reports />
    case "pengaturan":
      return <HelpPage settings />
    default:
      return <HelpPage />
  }
}
