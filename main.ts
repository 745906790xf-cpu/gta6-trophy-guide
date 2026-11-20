// Leonida Trophy Guide — entrypoint for make.fun bounty gta6-trophy-guide-01.
// Node 22, standard library only. Copies the static app and its screenshots
// into the output folder and writes dossier.json with the vendored builder.
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(rootDir, "app"), join(outputDir, "app"), { recursive: true });

const shotsDir = join(outputDir, "screenshots");
mkdirSync(shotsDir, { recursive: true });
const localShots = join(rootDir, "screenshots");
if (existsSync(localShots)) {
  cpSync(localShots, shotsDir, { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(outputDir, "dossier.json"), dossier);
