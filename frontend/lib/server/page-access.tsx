import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { authCookie, demoServer } from "./runtime"
import { isDomainError } from "../core/validation"
/** Route access is checked on the server; the client guard is additional UI feedback only. */
export async function pageAllowed(path: string) {
  try {
    demoServer.authorizePage((await cookies()).get(authCookie)?.value, path)
    return true
  } catch (error) {
    if (isDomainError(error)) {
      if (error.status === 401) redirect("/login")
      return false
    }
    throw error
  }
}
