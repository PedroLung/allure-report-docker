import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";

test.describe("Health check", () => {
  test.beforeEach(async () => {
    await allure.epic("API de exemplo");
    await allure.feature("Disponibilidade");
  });

  test("GET /health responde 200 com status ok", async ({ request }) => {
    await allure.severity("blocker");

    const response = await allure.step("Chamar GET /health", () => request.get("/health"));

    await allure.step("Validar status e corpo da resposta", async () => {
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({ status: "ok" });
    });
  });

  test("rota inexistente responde 404", async ({ request }) => {
    await allure.severity("minor");

    const response = await request.get("/nao-existe");

    expect(response.status()).toBe(404);
  });
});
