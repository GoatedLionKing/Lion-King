import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const source = join(root, "node_modules/@electric-sql/pglite/dist");
const target = join(root, ".output/server/_libs");

await mkdir(target, { recursive: true });

for (const file of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  await copyFile(join(source, file), join(target, file));
  console.log(`[pglite] copied ${file}`);
}
