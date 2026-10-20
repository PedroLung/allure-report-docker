// API de exemplo usada apenas para ter algo real para testar.
// Sem dependências: só o módulo http do Node.
const http = require("node:http");
const { randomUUID } = require("node:crypto");

const items = new Map();

function send(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(payload === undefined ? "" : JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const parts = pathname.split("/").filter(Boolean);

  try {
    if (req.method === "GET" && pathname === "/health") {
      return send(res, 200, { status: "ok" });
    }

    if (parts[0] === "items" && parts.length === 1) {
      if (req.method === "GET") {
        return send(res, 200, [...items.values()]);
      }
      if (req.method === "POST") {
        const { name, price } = await readJson(req);
        if (typeof name !== "string" || name.trim() === "") {
          return send(res, 400, { error: "name é obrigatório" });
        }
        if (typeof price !== "number" || price < 0) {
          return send(res, 400, { error: "price deve ser um número maior ou igual a 0" });
        }
        const item = { id: randomUUID(), name: name.trim(), price };
        items.set(item.id, item);
        return send(res, 201, item);
      }
    }

    if (parts[0] === "items" && parts.length === 2) {
      const item = items.get(parts[1]);
      if (req.method === "GET") {
        return item ? send(res, 200, item) : send(res, 404, { error: "não encontrado" });
      }
      if (req.method === "DELETE") {
        if (!item) return send(res, 404, { error: "não encontrado" });
        items.delete(item.id);
        return send(res, 204);
      }
    }

    return send(res, 404, { error: "rota não encontrada" });
  } catch (err) {
    if (err.message === "invalid_json") {
      return send(res, 400, { error: "JSON inválido" });
    }
    return send(res, 500, { error: "erro interno" });
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => console.log(`API de exemplo em http://localhost:${port}`));
