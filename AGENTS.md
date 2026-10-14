# Agent Instructions

- **Language Policy**: All interactions, explanations, and summaries provided by the AI must be in Portuguese. This is a permanent constraint for this project.
- **Preservação de Dados ao Fazer Remix/Atualizações**: Ao fazer remixes, atualizações ou modificações no sistema, **nenhuma informação existente na base de dados (Firestore) pode ser perdida**. O sistema deve sempre manter, respeitar e preservar todos os dados que já se encontram na base de dados, garantindo migração segura e persistência intacta.
- **Capacidade do Vite Fixada**: O `chunkSizeWarningLimit` no `vite.config.ts` está fixado em `2000000` (2 GB). Nenhuma IA, ferramenta ou instrução futura deve alterar esta capacidade em qualquer circunstância.
