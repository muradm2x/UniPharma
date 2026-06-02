import fs from "fs";
import path from "path";

const repoRoot = path.resolve(import.meta.dirname, "..");

function rmIfExists(relPath) {
  const absPath = path.join(repoRoot, relPath);
  try {
    fs.rmSync(absPath, { force: true });
  } catch {
    // ignore
  }
}

rmIfExists("package-lock.json");
rmIfExists("yarn.lock");

const ua = process.env.npm_config_user_agent ?? "";
if (!ua.startsWith("pnpm/")) {
  console.error("Use pnpm instead (this repo is a pnpm workspace).");
  process.exit(1);
}

