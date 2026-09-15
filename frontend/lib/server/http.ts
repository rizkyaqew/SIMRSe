import { NextResponse } from "next/server"
import { DomainError, isDomainError } from "../core/validation"
export function errorResponse(error: unknown) {
  return NextResponse.json(
    {
      error: isDomainError(error)
        ? error.message
        : "Server belum dapat memproses permintaan. Coba kembali.",
      fields: isDomainError(error) ? error.fields : {},
    },
    {
      status: isDomainError(error) ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    }
  )
}
export async function readBody(request: Request) {
  const origin = request.headers.get("origin")
  if (origin !== new URL(request.url).origin)
    throw new DomainError("Asal permintaan tidak diizinkan.", 403)
  const raw = await request.text()
  if (raw.length > 100_000)
    throw new DomainError("Permintaan terlalu besar.", 413)
  try {
    return JSON.parse(raw)
  } catch {
    throw new DomainError("Format permintaan tidak valid.", 400)
  }
}
