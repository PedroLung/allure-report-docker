# Imagem que só gera o relatório Allure (Java + Allure CLI).
# Os testes rodam fora do container; ele lê ./allure-results e escreve em ./allure-report.
FROM eclipse-temurin:21-jre

ARG ALLURE_VERSION=2.46.1

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl bash \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL "https://repo.maven.apache.org/maven2/io/qameta/allure/allure-commandline/${ALLURE_VERSION}/allure-commandline-${ALLURE_VERSION}.tgz" \
       | tar -xz -C /opt \
    && ln -s "/opt/allure-${ALLURE_VERSION}/bin/allure" /usr/local/bin/allure

WORKDIR /app
