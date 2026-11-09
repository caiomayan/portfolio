# CLAUDE.md

Portfólio pessoal (caiomayan.com). Spec: issue #1. O `main` vai direto pra produção, então o CI precisa estar verde.

- `docs/copy-deck.md` é a única fonte de texto.
- `DESIGN.md` é a fonte do visual.
- `GLOSSARY.md` traz os termos do projeto.
- `private/` é local: nunca leia, copie nem cite.
- O repositório é público: nenhum termo privado vai pra código, teste, commit, issue ou PR. Um hook de pre-commit (ligado pelo `npm install`) e um passo do CI procuram esses termos.
- Pra trazer o `main`, use `git merge origin/main`, sem rebase nem force push.
- Pare os servidores que subir.
- Antes de entregar: `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`.
