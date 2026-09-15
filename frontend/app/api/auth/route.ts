import { NextRequest, NextResponse } from "next/server"
import { authCookie, workspaceCookie, demoServer } from "@/lib/server/runtime"
import { errorResponse, readBody } from "@/lib/server/http"
import { DomainError } from "@/lib/core/validation"
export const runtime = "nodejs"
export async function POST(request: NextRequest) {
  try {
    const body = await readBody(request)
    if (!body || typeof body.accountId !== "string")
      throw new DomainError("Pilih akun demo yang valid.", 400)
    const result = demoServer.login(
      body.accountId,
      request.cookies.get(workspaceCookie)?.value
    )
    demoServer.logout(request.cookies.get(authCookie)?.value)
    const response = NextResponse.json(
      { state: demoServer.read(result.token) },
      { headers: { "Cache-Control": "no-store" } }
    )
    const options = {
      httpOnly: true,
      sameSite: "strict" as const,
      path: "/",
      maxAge: 8 * 60 * 60,
      secure: request.nextUrl.protocol === "https:",
    }
    response.cookies.set(authCookie, result.token, options)
    response.cookies.set(workspaceCookie, result.workspaceId, options)
    return response
  } catch (error) {
    return errorResponse(error)
  }
}
export async function DELETE(request: NextRequest) {
  try {
    await readBody(request)
    demoServer.logout(request.cookies.get(authCookie)?.value)
    const response = NextResponse.json({ ok: true })
    response.cookies.delete(authCookie)
    return response
  } catch (error) {
    return errorResponse(error)
  }
}
