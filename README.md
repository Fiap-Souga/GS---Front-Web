# Raiz Urbana

Aplicação demonstrativa para aproximar comunidades de áreas verdes, monitoramento climático local e hábitos sustentáveis. O projeto contém uma página de apresentação e um perfil comunitário com iniciativas que podem ser consultadas e gerenciadas.

## Requisitos

- Node.js 20.19 ou superior
- npm

## Executar e testar

```bash
npm ci
npm run dev
```

O Vite informa no terminal o endereço local. Para executar os testes dos fluxos da interface e da API:

```bash
npm test
```

## API local e dados

O servidor Express em `server/` oferece cadastro/login, perfil, árvore e planos. Por padrão, os dados são gravados localmente em `server/data/raiz-urbana.json`:

- `POST /api/auth/register` — recebe `{ "name": "...", "email": "...", "password": "..." }`.
- `POST /api/auth/login` — recebe `{ "email": "...", "password": "..." }` e devolve um token Bearer de acesso válido por 15 minutos.
- `GET /api/auth/me` — retorna o perfil com `Authorization: Bearer <accessToken>`.
- `GET /api/health` — verificação básica do servidor.
- `/api/profile` — consulta e atualiza o perfil autenticado.
- `/api/profile/tree-visits` — registra visitas e permite reiniciar a árvore.
- `/api/profile/habit-entries` — cria, atualiza e exclui registros pessoais diários de atividade, água e passos.
- `/api/plans` — CRUD de planos pessoais persistidos por usuário.

O arquivo guarda nome, e-mail normalizado, **hash bcrypt da senha**, visitas, registros de hábitos e planos associados ao dono da conta. Novas contas começam sem registros; nada é preenchido automaticamente nem medido em segundo plano. A senha original nunca é salva. A API fica vinculada a `127.0.0.1`, ou seja, acessível somente neste computador; não configure redirecionamento de portas do roteador. Sessões usam cookie HttpOnly com proteção CSRF.

### Configuração local

1. Copie `.env.example` para `.env` e gere um segredo JWT:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
   ```

2. Em um terminal, execute `npm run api:dev`; em outro, `npm run dev`. O proxy do Vite encaminha `/api` para `http://localhost:4000`.
3. Crie uma conta no perfil. A API cria automaticamente `server/data/raiz-urbana.json`; mantenha esse arquivo privado e faça cópias de segurança protegidas.

`DATA_FILE` permite escolher outro caminho para o arquivo JSON. `.env`, o arquivo de dados e cópias de segurança não devem ser enviados ao Git nem compartilhados.

Esta configuração é para demonstração e uso local, não para receber contas de usuários pela internet: o computador precisa ficar ligado e conectado, e o armazenamento JSON não tem as garantias de disponibilidade, backup e concorrência de um serviço de produção. Para usuários remotos, hospede a API em um serviço seguro e use um banco apropriado.

Sem login, a página mostra perfis e iniciativas demonstrativos; alterações nessa demonstração não são persistidas. Com login, o perfil pode ser renomeado, as visitas à árvore e os registros diários de hábitos podem ser adicionados, editados e excluídos, e os planos privados podem ser criados, editados e removidos. Esses dados ficam no arquivo JSON local e começam vazios para cada conta. Um convite no canto inicia um tour guiado pelas áreas do perfil; o painel de hábitos também oferece um gráfico semanal e exportação dos registros em CSV.

Antes de aceitar usuários reais, publique uma política de privacidade adequada à LGPD, defina retenção e exclusão de contas, configure backups e recuperação, e faça uma revisão de segurança e operação do ambiente hospedado.

### Cadastro para receber atualizações

O formulário no final da página inicial envia o e-mail ao Formspree (`https://formspree.io/f/xeaawgoz`) para registrar interesse em receber atualizações. Os envios podem ser consultados na caixa de entrada do formulário na conta Formspree que administra esse endpoint. A aplicação não mantém uma cópia local desses cadastros. Para usar o formulário, confirme o endpoint e conclua a ativação/confirmação solicitada pelo Formspree na conta responsável.

## Páginas

- `/` — apresentação do projeto, áreas prioritárias, monitoramento e participação.
- `/perfil.html` — acesso à conta, tutorial, árvore digital, registros pessoais de hábitos e painel de planos comunitários.

## Funcionalidades e arquitetura

- Vite com duas entradas HTML, React e Tailwind CSS.
- Painel de iniciativas com oito componentes, filtros por texto/região, formulários validados e operações de criar, consultar, atualizar e excluir.
- Hooks personalizados para carregar e gerenciar registros, estado/validação de formulário e fechamento de diálogos.
- Acesso à API isolado em `src/services/recordsApi.js`.
- Testes automatizados dos principais fluxos do painel em `src/components/CommunityRecordsApp.test.jsx`.

O restante das páginas originais é mantido em JavaScript para preservar as interações existentes; o painel de iniciativas é uma ilha React integrada ao perfil.

## API e dados demonstrativos

Sem login, o painel apresenta oito iniciativas demonstrativas em português do Brasil e permite testar criação, edição e exclusão temporárias; essas alterações desaparecem ao recarregar a página e não dependem de API externa. Com uma conta autenticada, o painel alterna para a API própria e salva os planos por usuário no arquivo JSON local.

As leituras climáticas e estatísticas de hábitos continuam fictícias. Ainda não há integração real com totens nem monitoramento de localização. O formulário de conta permite cadastro/login; visitas da árvore e planos são registrados apenas quando a pessoa os informa, associados à sua conta e salvos no arquivo JSON local. Sem login, o progresso da árvore fica somente no armazenamento local do navegador.

## Build

```bash
npm run build
npm run preview
```

Os arquivos prontos para publicação são gerados em `dist/`. `node_modules/` e `dist/` não são necessários no Git; podem ser recriados com os comandos acima.

O site carrega imagens do Unsplash e fontes do Google Fonts, portanto esses recursos externos dependem de conexão com a internet.

## Publicação na Vercel

Depois de autenticar a Vercel CLI (`npx vercel login`), execute `npx vercel` para criar uma prévia e `npx vercel --prod` para publicar em produção. A configuração de build usa `npm run build` e a pasta `dist/`.

A configuração atual da Vercel publica apenas o site estático; ela não acessa o arquivo no seu computador. O armazenamento JSON local não deve ser usado como banco de produção em uma hospedagem serverless.

### Contas na versão publicada

Na Vercel, o build detecta a variável de ambiente `VERCEL=1` e ativa contas locais no navegador, sem enviar login, senha ou dados pessoais à API. A senha deriva uma chave criptográfica; perfil, visitas, hábitos e planos são cifrados no `localStorage` antes de serem salvos. A senha original não é armazenada.

Esse modo é apenas para demonstração: cada navegador tem suas próprias contas e dados, não há sincronização entre aparelhos ou entre o site publicado e o JSON do computador, e limpar os dados do navegador apaga as contas. Não é uma autenticação centralizada nem substitui um servidor para uso real. Para testar esse modo em outro ambiente, defina `VITE_BROWSER_ACCOUNTS=true` durante o build.
