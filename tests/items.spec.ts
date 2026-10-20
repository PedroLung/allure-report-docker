import { test, expect, type APIRequestContext } from "@playwright/test";
import * as allure from "allure-js-commons";

type Item = { id: string; name: string; price: number };

async function createItem(request: APIRequestContext, data: { name: string; price: number }) {
  return allure.step(`Criar item "${data.name}"`, async () => {
    const response = await request.post("/items", { data });
    expect(response.status()).toBe(201);
    return (await response.json()) as Item;
  });
}

test.describe("Itens", () => {
  test.beforeEach(async () => {
    await allure.epic("API de exemplo");
    await allure.feature("Itens");
  });

  test("cria um item", async ({ request }) => {
    await allure.story("Criação");
    await allure.severity("critical");

    const item = await createItem(request, { name: "Teclado", price: 199.9 });
    await allure.attachment("item criado", JSON.stringify(item, null, 2), "application/json");

    expect(item).toMatchObject({ name: "Teclado", price: 199.9 });
    expect(item.id).toBeTruthy();
  });

  test("busca um item pelo id", async ({ request }) => {
    await allure.story("Consulta");
    await allure.severity("critical");

    const created = await createItem(request, { name: "Mouse", price: 89 });

    const response = await allure.step("Buscar item criado", () => request.get(`/items/${created.id}`));

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(created);
  });

  test("a listagem inclui o item criado", async ({ request }) => {
    await allure.story("Consulta");
    await allure.severity("normal");

    const created = await createItem(request, { name: "Monitor", price: 999 });

    const response = await request.get("/items");
    const items = (await response.json()) as Item[];

    expect(response.status()).toBe(200);
    expect(items.map((i) => i.id)).toContain(created.id);
  });

  test("remove um item e depois ele não existe mais", async ({ request }) => {
    await allure.story("Remoção");
    await allure.severity("normal");

    const created = await createItem(request, { name: "Headset", price: 250 });

    const deleted = await allure.step("Remover item", () => request.delete(`/items/${created.id}`));
    expect(deleted.status()).toBe(204);

    const after = await allure.step("Buscar item removido", () => request.get(`/items/${created.id}`));
    expect(after.status()).toBe(404);
  });

  const invalidPayloads = [
    { titulo: "sem nome", data: { price: 10 } },
    { titulo: "nome vazio", data: { name: "  ", price: 10 } },
    { titulo: "preço negativo", data: { name: "Item", price: -1 } },
    { titulo: "preço como texto", data: { name: "Item", price: "10" } },
  ];

  for (const { titulo, data } of invalidPayloads) {
    test(`rejeita criação inválida: ${titulo}`, async ({ request }) => {
      await allure.story("Validação");
      await allure.severity("normal");
      await allure.parameter("payload", JSON.stringify(data));

      const response = await request.post("/items", { data });

      expect(response.status()).toBe(400);
      expect(await response.json()).toHaveProperty("error");
    });
  }

  // Aparecem no relatório como "skipped": úteis para mostrar o panorama completo.
  test.skip("filtra itens por faixa de preço (ainda não implementado)", async () => {});
  test.fixme("paginação da listagem", async () => {});
});
