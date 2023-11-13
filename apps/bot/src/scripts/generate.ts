import "reflect-metadata";

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { generateCommandsArray } from "@thoth/interactions";
import { config } from "dotenv";
import { loadTranslations } from "#util/index.js";

process.env.NODE_ENV ??= "development";
config({ path: join(process.cwd(), ".env") });

console.log("Generating commands array...");
await loadTranslations(fileURLToPath(new URL("../locales", import.meta.url)));

const commands = (await generateCommandsArray()).filter((cmd) => !cmd.dev);
const path = join(
  fileURLToPath(new URL("../../../../", import.meta.url)),
  "commands.lock.json",
);
console.log(`Writing commands array to ${path}...`);
writeFile(path, JSON.stringify(commands, null, 2));
