// Issue #46: o texto do JSON-LD nunca fecha o <script> antes da hora. Roda com o test runner do Node (npm run test:idioma).
import assert from "node:assert/strict";
import { test } from "node:test";
import { jsonLdText } from "../../lib/structured-data-text.ts";

test("o < sai escapado: um valor com </script> não fecha a tag", () => {
  const texto = jsonLdText({ name: "a</script><script>alert(1)</script>" });
  assert.ok(!texto.includes("<"), texto);
  assert.ok(texto.includes("\\u003c/script"), texto);
});

test("o texto escapado continua sendo JSON válido e volta ao valor original", () => {
  const dado = { name: "x</script>y", n: 1 };
  assert.deepEqual(JSON.parse(jsonLdText(dado)), dado);
});
