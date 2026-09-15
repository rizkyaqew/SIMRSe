import { NextRequest, NextResponse } from "next/server"
import { authCookie, demoServer } from "@/lib/server/runtime"
import { errorResponse, readBody } from "@/lib/server/http"
export const runtime = "nodejs"
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(authCookie)?.value
    const path = request.nextUrl.searchParams.get("path")
    const state = path
      ? demoServer.authorizePage(token, path)
      : demoServer.read(token)
    return NextResponse.json(
      { state },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    return errorResponse(error)
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await readBody(request)
    return NextResponse.json(
      {
        state: demoServer.mutate(request.cookies.get(authCookie)?.value, body),
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    return errorResponse(error)
  }
}
