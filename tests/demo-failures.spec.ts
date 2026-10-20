import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";

// Testes que FALHAM DE PROPÓSITO, só para mostrar como o Allure exibe cada tipo de falha.
// Eles só são registrados quando DEMO_FAILURES=1 (veja: npm run test:demo).
// Sem a variável, o projeto roda normalmente e fica todo verde.
if (process.env.DEMO_FAILURES) {
  test.describe("Demonstração de falhas (intencionais)", () => {
    test.beforeEach(async () => {
      await allure.epic("Demonstração de falhas");
      await allure.tag("demo");
    });

    // 1) FAILED: a asserção não bate. Cai na categoria "Falhas de produto".
    test("atualiza um item com PUT /items/:id (ainda não implementado)", async ({ request }) => {
      await allure.feature("Falha de asserção (failed)");
      await allure.severity("critical");
      await allure.owner("time-backend");
      await allure.issue("https://example.com/issues/DEMO-101", "DEMO-101");
      await allure.description(
        "A API ainda **não implementa** `PUT /items/:id`. O teste espera `200` e recebe `404`.",
      );

      const created = await allure.step("Criar item para atualizar", async () => {
        const response = await request.post("/items", { data: { name: "Cabo USB", price: 25 } });
        return (await response.json()) as { id: string };
      });

      const response = await allure.step("Atualizar o preço do item", () =>
        request.put(`/items/${created.id}`, { data: { price: 30 } }),
      );

      await allure.attachment("resposta da API", await response.text(), "application/json");

      await allure.step("Validar que a atualização foi aceita", async () => {
        expect(response.status()).toBe(200);
      });
    });

    // 2) FAILED: comportamento esperado que a API não tem (o filtro é ignorado).
    test.skip("filtra a listagem por nome (o filtro é ignorado pela API)", async ({ request }) => {
      await allure.feature("Falha de asserção (failed)");
      await allure.severity("normal");
      await allure.issue("https://example.com/issues/DEMO-102", "DEMO-102");

      const unique = `filtro-${Date.now()}`;
      await request.post("/items", { data: { name: unique, price: 10 } });
      await request.post("/items", { data: { name: "Outro item", price: 20 } });

      const response = await request.get(`/items?name=${unique}`);
      const items = (await response.json()) as unknown[];
      await allure.parameter("filtro", unique);

      expect(items).toHaveLength(1);
    });

    // 3) BROKEN: o teste estoura o tempo (timeout), não é uma asserção falhando.
    // O Allure marca como "broken" e cai na categoria "Falhas de teste ou de ambiente".
    test("aguarda um serviço externo que nunca responde (timeout)", async () => {
      test.setTimeout(1500);
      await allure.feature("Falha de ambiente (broken)");
      await allure.severity("minor");
      await allure.description("O serviço externo não responde e o teste estoura o tempo limite de 1,5 s.");

      await allure.step("Aguardar resposta do serviço de cotação", async () => {
        await new Promise((resolve) => setTimeout(resolve, 10_000));
      });
    });

    // 4) FLAKY: falha na 1ª tentativa e passa na 2ª. O Allure mostra as tentativas (retries).
    test.describe("Teste instável", () => {
      test.describe.configure({ retries: 1 });

      test("passa apenas na segunda tentativa", async () => {
        await allure.feature("Instabilidade (flaky)");
        await allure.severity("normal");
        await allure.parameter("tentativa", String(test.info().retry + 1));

        expect(test.info().retry).toBeGreaterThan(0);
      });
    });
  });
}