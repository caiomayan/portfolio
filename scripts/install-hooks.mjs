// Liga o hook versionado em .githooks (script `prepare`). Não falha fora de um repositório git (ex.: build em CI de deploy).
import { execFileSync } from "node:child_process";

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
} catch {
  // sem git: nada a fazer
}
