# Escape Room

Projeto "Escape Room" — coleção de versões/experimentos de um jogo tipo escape-room. O repositório contém uma implementação em C focada em lógica de labirinto e uma reimplementação web moderna em React/Vite (pasta `web-remake`).

**Visão geral**

- Implementação C (console/nível educativo): arquivos como `dungeon_map.c` com a lógica do labirinto e mecanismos de desbloqueio.
- Recriação web (UI moderna): a pasta `web-remake` contém uma aplicação React + Vite com rotas, componentes e estilos pronta para desenvolvimento local.

**Como rodar (web / desenvolvimento)**

1. Instale o Node.js (recomendado 18+).
2. Entre na pasta do front-end:

```bash
cd web-remake
```

3. Instale dependências e rode em modo de desenvolvimento:

```bash
npm install
npm run dev
```

4. Build de produção:

```bash
npm run build
npm run preview  # serve a build localmente
```

Observação: o projeto também tem arquivos de configuração relacionados a Bun/Cloudflare (por exemplo `bunfig.toml`, `wrangler.jsonc`), mas a forma mais direta de desenvolvimento local usa os scripts npm/Vite acima.

**Scripts úteis (em `web-remake/package.json`)**

- `npm run dev` — inicia o servidor Vite em modo desenvolvimento.
- `npm run build` — gera a build de produção.
- `npm run build:dev` — build em modo development.
- `npm run preview` — pré-visualiza a build gerada.
- `npm run lint` — executa ESLint no código.
- `npm run format` — formata o projeto com Prettier.

**Estrutura principal do repositório**

- `dungeon_map.c`, `game.html`, `game.js` — artefatos/versões antigas e experimentos do jogo.
- `web-remake/` — reimplementação web (principal para desenvolvimento atual):
	- `package.json`, `vite.config.ts`, `tsconfig.json` — configuração do projeto.
	- `src/` — código fonte do app web:
		- `routes/` — rotas React (ex.: `index.tsx`, `game.tsx`).
		- `components/` — componentes UI reutilizáveis (muitos em `components/ui/`).
		- `lib/` — utilitários e lógica de jogo compartilhada (`gameLogic.ts`, `utils.ts`).
		- `assets/` — imagens e outros recursos estáticos.
		- `styles.css`, `game.css` — estilos globais.

**Tecnologias**

- React 19 + TypeScript
- Vite (dev server / build)
- TanStack Router / TanStack React (rotas e estado)
- TailwindCSS (estilização)
- Várias bibliotecas Radix UI e utilitárias para componentes e UX

**Para desenvolvedores**

- Linters e formatação: rode `npm run lint` e `npm run format` antes de abrir PRs.
- Tipagem: o repositório usa TypeScript; mantenha tipos bem definidos nas mudanças.
- Se for integrar deploy Cloudflare Workers / Bun, revise `wrangler.jsonc` e `bunfig.toml`.
