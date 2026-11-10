// Prova que a verificação falha com um termo e passa sem ele, sem nunca imprimi-lo.
// O termo aqui é inventado de propósito; nunca coloque um termo real em teste.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SCRIPT = resolve("scripts/check-forbidden-terms.mjs");
const FAKE = "Zzqx-Termo-Falso"; // maiúsculas misturadas: o casamento ignora caixa

function repo(files) {
  const dir = mkdtempSync(join(tmpdir(), "terms-"));
  const git = (...a) => execFileSync("git", a, { cwd: dir, stdio: "ignore" });
  git("init", "-q");
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), content);
  }
  git("add", "-A");
  return dir;
}

function run(dir, args, env) {
  const r = spawnSync("node", [SCRIPT, ...args], {
    cwd: dir,
    env: { ...process.env, FORBIDDEN_TERMS: "", ...env },
    encoding: "utf8",
  });
  return { code: r.status, out: r.stdout + r.stderr };
}

test("falha com o termo em arquivo versionado e mostra só arquivo e linha", () => {
  const dir = repo({ "a.txt": "ok\nlinha com zzqx-termo-falso aqui\n", "b.txt": "limpo\n" });
  const r = run(dir, [], { FORBIDDEN_TERMS: `outro-inventado|${FAKE}` });
  assert.equal(r.code, 1);
  assert.match(r.out, /a\.txt:2/);
  assert.ok(!/b\.txt/.test(r.out));
  assert.ok(!r.out.toLowerCase().includes("zzqx"));
  assert.ok(!r.out.toLowerCase().includes("outro-inventado"));
  rmSync(dir, { recursive: true, force: true });
});

test("passa quando o termo não aparece", () => {
  const dir = repo({ "a.txt": "tudo limpo\n" });
  assert.equal(run(dir, [], { FORBIDDEN_TERMS: FAKE }).code, 0);
  rmSync(dir, { recursive: true, force: true });
});

test("ignora package-lock.json e binários", () => {
  const dir = repo({ "package-lock.json": `${FAKE}\n` });
  writeFileSync(join(dir, "img.bin"), Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from(FAKE)]));
  execFileSync("git", ["add", "-A"], { cwd: dir });
  assert.equal(run(dir, [], { FORBIDDEN_TERMS: FAKE }).code, 0);
  rmSync(dir, { recursive: true, force: true });
});

test("sem lista, avisa e deixa passar", () => {
  const dir = repo({ "a.txt": FAKE });
  const r = run(dir, []);
  assert.equal(r.code, 0);
  assert.match(r.out, /Aviso/);
  rmSync(dir, { recursive: true, force: true });
});

test("modo --staged lê a lista de um arquivo e olha só o que está em stage", () => {
  const dir = repo({ "a.txt": "limpo\n" });
  writeFileSync(join(dir, "terms.txt"), `# comentário\n${FAKE}\n`);
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "x"], { cwd: dir, stdio: "ignore" });
  writeFileSync(join(dir, "new.txt"), `x\n${FAKE}\n`);
  execFileSync("git", ["add", "new.txt"], { cwd: dir });
  writeFileSync(join(dir, "unstaged.txt"), FAKE);
  const r = run(dir, ["--staged", "--terms-file", join(dir, "terms.txt")]);
  assert.equal(r.code, 1);
  assert.match(r.out, /new\.txt:2/);
  assert.ok(!/unstaged/.test(r.out));
  assert.ok(!r.out.toLowerCase().includes("zzqx"));
  const missing = run(dir, ["--staged", "--terms-file", join(dir, "nao-existe.txt")]);
  assert.equal(missing.code, 0);
  rmSync(dir, { recursive: true, force: true });
});
