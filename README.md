# GameboyFit

App de treino de academia com arquitetura de cartuchos — cada programa de treino é um cartucho que pode ser instalado, compartilhado ou comprado.

## Stack

- **React Native** + Expo 54
- **TypeScript** (strict)
- **expo-router** para navegação
- **AsyncStorage** para persistência local

## Estrutura

```
src/
├── features/
│   ├── cartridge/       # Tudo sobre cartuchos (tipos, hooks, componentes)
│   ├── workout/         # Execução de treino (hooks, tipos, componentes)
│   └── history/         # Histórico de sessões
├── components/
│   └── ui/              # Componentes reutilizáveis (Badge, ScreenHeader...)
├── services/
│   ├── CartridgeService.ts   # Carrega, valida e instala cartuchos
│   └── SessionService.ts     # Persiste e consulta sessões de treino
├── constants/           # Todas as constantes do app (rotas, chaves, enums)
├── i18n/                # Strings em pt-BR (preparado para internacionalização)
└── utils/               # Funções puras (format, tokens de design)

app/                     # Rotas (expo-router) — só UI, zero lógica de negócio
__tests__/               # Testes unitários por feature
.github/workflows/       # CI automático (typecheck + testes a cada push)
```

## Rodar localmente

```bash
npm install
npx expo start
```

Escaneia o QR com o app **Expo Go** no iPhone.

## Formato do cartucho

Cada programa de treino é um arquivo JSON com schema versionado (`$schema: https://gameboy.fit/cartridge/v1`). Ver `src/data/cartridge-elite-futebol.json` como referência.
