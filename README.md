# Algoritmos de Busca em Strings

Busca de padrões em texto com 4 algoritmos: **Naive**, **Rabin-Karp**, **KMP** e
**Boyer-Moore**. Inclui interface com passo a passo, dashboard de comparação e
observabilidade com OpenTelemetry.

## Como executar

### No navegador (sem instalar nada)

Abra com duplo clique:

- `web/index.html` — buscar um padrão e ver a execução passo a passo.
- `web/dashboard.html` — gráficos comparando os algoritmos.

### No terminal (Node.js 20+)

Na raiz do projeto:

```bash
npm install        # primeira vez
npm run demo       # demonstração rápida
npm run bench      # compara os 4 algoritmos
npm test           # testes
```

Buscar com um algoritmo específico:

```bash
npm run start -- --algo kmp --steps --pattern algoritmo
```

## Estrutura

```
web/      interface e dashboard
src/      código (algoritmos, Strategy, telemetria)
test/     testes
docs/     RELATORIO.pdf
```

## Algoritmos

| Algoritmo | Complexidade |
|---|---|
| Naive | O(n·m) |
| Rabin-Karp | O(n+m) médio |
| KMP | O(n+m) |
| Boyer-Moore | O(n/m) melhor |
