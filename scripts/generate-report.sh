#!/usr/bin/env bash
# Gera o relatório Allure preservando o histórico da execução anterior.
#
# Como o histórico funciona: o Allure grava a pasta "history" dentro de cada relatório.
# Antes de gerar o próximo, copiamos essa pasta para dentro dos resultados.
# Assim o relatório novo mostra tendências (gráficos de evolução e "retries").
#
# Os resultados originais NUNCA são alterados: trabalhamos em uma cópia temporária.
# Isso evita problemas de permissão quando o script roda dentro de um container.
set -euo pipefail

RESULTS_DIR="${RESULTS_DIR:-allure-results}"
REPORT_DIR="${REPORT_DIR:-allure-report}"
# No Docker o comando é "allure"; localmente pode ser: ALLURE_BIN='npx allure'
ALLURE_BIN="${ALLURE_BIN:-allure}"

if [ ! -d "$RESULTS_DIR" ] || [ -z "$(ls -A "$RESULTS_DIR" 2>/dev/null)" ]; then
  echo "Nenhum resultado em '$RESULTS_DIR'. Rode os testes antes: npm test" >&2
  exit 1
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

cp -r "$RESULTS_DIR"/. "$WORK_DIR"/

if [ -d "$REPORT_DIR/history" ]; then
  echo "Reaproveitando histórico de $REPORT_DIR/history"
  rm -rf "$WORK_DIR/history"
  cp -r "$REPORT_DIR/history" "$WORK_DIR/history"
else
  echo "Nenhum histórico anterior: este é o primeiro relatório."
fi

# Categorias de falha (opcional)
if [ -f categories.json ]; then
  cp -f categories.json "$WORK_DIR/categories.json"
fi

# shellcheck disable=SC2086
$ALLURE_BIN generate "$WORK_DIR" --clean -o "$REPORT_DIR"

echo "Relatório gerado em $REPORT_DIR/index.html"