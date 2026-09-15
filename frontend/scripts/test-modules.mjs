import {
  mkdtemp,
  readFile,
  readdir,
  mkdir,
  writeFile,
  rm,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { after } from "node:test"
import ts from "typescript"
// Compile local pure/server domain modules once per test process; no runtime test dependency.
const parent = path.resolve(tmpdir()),
  output = await mkdtemp(path.join(parent, "simrs-domain-tests-"))
const source = fileURLToPath(new URL("../lib/", import.meta.url))
async function compile(directory) {
  for (const entry of await readdir(path.join(source, directory), {
    withFileTypes: true,
  })) {
    if (!entry.name.endsWith(".ts") || ["http.ts"].includes(entry.name))
      continue
    const relative = path.join(directory, entry.name),
      input = await readFile(path.join(source, relative), "utf8")
    const result = ts
      .transpileModule(input, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      })
      .outputText.replace(
        /(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g,
        (_, a, b, c) => `${a}${b}.js${c}`
      )
    await mkdir(path.join(output, directory), { recursive: true })
    await writeFile(path.join(output, relative.replace(/\.ts$/, ".js")), result)
  }
}
await writeFile(path.join(output, "package.json"), '{"type":"module"}')
for (const directory of ["platform", "core", "simrs", "server"])
  await compile(directory)
after(async () => {
  const resolved = path.resolve(output)
  if (
    path.dirname(resolved) === parent &&
    path.basename(resolved).startsWith("simrs-domain-tests-")
  )
    await rm(resolved, { recursive: true, force: true })
})
export const loadModule = (name) =>
  import(pathToFileURL(path.join(output, `${name}.js`)).href)
