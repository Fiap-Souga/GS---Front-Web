# Raiz Urbana

Aplicação demonstrativa para aproximar comunidades de áreas verdes, monitoramento climático local e hábitos sustentáveis. O projeto contém uma página de apresentação e um perfil comunitário com iniciativas que podem ser consultadas e gerenciadas.

## Requisitos

- Node.js 20 ou superior
- npm

## Executar e testar

```bash
npm ci
npm run dev
```

O Vite informa no terminal o endereço local. Para executar os testes dos fluxos React:

```bash
npm test
```

## Páginas

- `/` — apresentação do projeto, áreas prioritárias, monitoramento e participação.
- `/perfil.html` — perfis demonstrativos, hábitos, visitas, árvore digital e painel React de iniciativas comunitárias.

## Funcionalidades e arquitetura

- Vite com duas entradas HTML, React e Tailwind CSS.
- Painel de iniciativas com oito componentes, filtros por texto/região, formulários validados e operações de criar, consultar, atualizar e excluir.
- Hooks personalizados para carregar e gerenciar registros, estado/validação de formulário e fechamento de diálogos.
- Acesso à API isolado em `src/services/recordsApi.js`.
- Testes automatizados dos principais fluxos do painel em `src/components/CommunityRecordsApp.test.jsx`.

O restante das páginas originais é mantido em JavaScript para preservar as interações existentes; o painel de iniciativas é uma ilha React integrada ao perfil.

## API e dados demonstrativos

O painel utiliza a API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com/posts). Ela aceita GET, POST, PUT e DELETE para demonstração, mas não persiste alterações: os novos itens e edições somem ao atualizar a página. O painel informa essa limitação.

As leituras climáticas, estatísticas, perfis, afinidades e visitas também são fictícias. Não há autenticação, integração real com totens, monitoramento de localização ou coleta de dados pessoais. O progresso manual da árvore digital é salvo somente no armazenamento local do navegador.

## Build

```bash
npm run build
npm run preview
```

Os arquivos prontos para publicação são gerados em `dist/`. `node_modules/` e `dist/` não são necessários no Git; podem ser recriados com os comandos acima.

O site carrega imagens do Unsplash e fontes do Google Fonts, portanto esses recursos externos dependem de conexão com a internet.

## Publicação na Vercel

Depois de autenticar a Vercel CLI (`npx vercel login`), execute `npx vercel` para criar uma prévia e `npx vercel --prod` para publicar em produção. A configuração de build usa `npm run build` e a pasta `dist/`.
