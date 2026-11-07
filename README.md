# Ficha do projeto — CitizenTech

| Item | Definição |
|---|---|
| Cidadão | Moradores de áreas urbanas que usam ou gostariam de usar praças e parques do bairro. |
| Problema investigado | A proposta parte da dificuldade de acompanhar condições ambientais locais e encontrar formas simples de participar do cuidado de áreas verdes. Esta é uma hipótese de projeto, não uma conclusão de pesquisa com moradores. |
| Solução | Site demonstrativo que reúne estimativas meteorológicas, registros pessoais de hábitos e visitas, e um painel para organizar ações comunitárias. |
| Participação por disciplina | **Web Development:** páginas, acessibilidade, perfil e CRUD de ações. **Dados:** consulta e apresentação de previsões públicas da Open-Meteo. **IoT:** não implementado; o projeto não lê sensores. |
| Indicador do protótipo | Quantidade de ações cadastradas e visitas a áreas verdes registradas voluntariamente no perfil. São registros do protótipo, não evidência de ações realizadas nem de impacto ambiental. |
| ODS de referência | **ODS 11** — Cidades e comunidades sustentáveis; **ODS 13** — Ação contra a mudança global do clima; **ODS 15** — Vida terrestre. Sugestões adotadas pela equipe; a relação é temática e não comprova impacto nesses objetivos. |
| Repositório | [Fiap-Souga/GS---Front-Web](https://github.com/Fiap-Souga/GS---Front-Web) |
| Publicação informada | [Raiz Urbana na Vercel](https://gs-front-web-two.vercel.app/) |

**Evidência de campo a completar pela equipe:** registre uma conversa ou observação real com cidadãos, com data, método e síntese anonimizada. Não há evidência de pesquisa com moradores neste repositório, e ela não deve ser inventada.

## Raiz Urbana

Aplicação demonstrativa sobre áreas verdes, clima urbano e participação comunitária. O projeto reúne uma página de apresentação e um perfil com conta, hábitos, árvore digital e planos comunitários.

## Requisitos

- Node.js 20.19 ou superior
- npm

## Instalação rápida

No terminal, entre na pasta do projeto e instale as dependências:

```bash
npm ci
```

Inicie o site:

```bash
npm run dev
```

Abra o endereço informado pelo Vite (normalmente `http://localhost:5173`). A página inicial fica em `/` e o perfil em `/perfil.html`.

Para executar os testes automatizados e gerar a versão de produção:

```bash
npm test
npm run build
npm run preview
```

O build gera os arquivos estáticos em `dist/`.

## O que há no projeto

### Página inicial — `/`

- Apresentação da proposta e das ações da Raiz Urbana.
- Diagrama ilustrativo de regiões com condições meteorológicas atuais e previsão fornecidas pela Open-Meteo.
- Leitura guiada por capítulos e apresentação em slides.
- Formulário de interesse para receber novidades.

### Perfil — `/perfil.html`

- Cadastro, login e edição de nome de perfil.
- Registros pessoais de atividade, água, passos e visitas a áreas verdes, incluindo parques ou lugares personalizados.
- Árvore digital, resumo de hábitos, gráfico semanal e exportação CSV.
- Painel de ações comunitárias com local e data programada, busca e filtro por região.
- CRUD completo de ações: no perfil autenticado, os dados são salvos na conta local; no modo visitante, as ações são lidas e gravadas na API pública RESTful API.
- Calendário mensal de impacto com marcadores para visitas verdes, hábitos e ações, incluindo detalhes ao passar o mouse ou selecionar um dia.
- Tour para conhecer as áreas do perfil e controles de acessibilidade para ampliar o conteúdo.

### Tecnologias e estrutura

- Vite e JavaScript para as páginas; React para o painel de conta, hábitos e planos.
- Express para a API local; Vitest e Testing Library para testes.
- `src/main.js` e `src/perfil.js`: entradas das duas páginas.
- `src/services/`: integração com API, contas locais e formulário de interesse.
- `src/components/`: painéis React.
- `server/`: API, rotas, modelos e armazenamento JSON local.
- `AI.md` e `prompts.md`: uso de IA e exemplos de prompts.

As condições climáticas consultam a API pública da Open-Meteo, sem chave de API. São estimativas de modelos meteorológicos para as coordenadas consultadas, não medições de sensores instalados no bairro; a resolução do modelo pode apontar para uma grade próxima. A qualidade do ar usa o índice US AQI e pode aparecer como indisponível se a fonte não responder. O diagrama de regiões é ilustrativo e não representa posições cartográficas.

As estatísticas são demonstrativas, e as ações públicas criadas por visitantes não são verificadas como eventos realizados. Não há integração com sensores locais nem rastreamento de localização.

### CRUD demonstrativo de ações

O painel visitante usa o endpoint [`https://api.restful-api.dev/objects`](https://api.restful-api.dev/objects) para executar `GET`, `POST`, `PUT` e `DELETE`. O conteúdo fica no serviço público; a lista de identificadores fica no armazenamento deste navegador e não sincroniza com outros dispositivos. Limpar os dados do navegador apaga essa lista, mas não apaga os objetos remotos. Os registros podem ser acessados por quem conhece o identificador. Não envie dados pessoais nem informações sensíveis. A API pode limitar requisições; para produção, use um serviço próprio com controle de acesso e persistência. Para manter planos privados, entre em uma conta local do navegador ou inicie a API local conforme as instruções abaixo.

## Modos de conta

### API local (dados no computador)

Use este modo para persistir contas e dados no arquivo JSON local do projeto.

1. No primeiro terminal, crie um segredo JWT e inicie a API:

   **PowerShell**

   ```powershell
   $env:JWT_SECRET = (node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))")
   npm run api:dev
   ```

   **macOS/Linux**

   ```bash
   export JWT_SECRET="$(node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))")"
   npm run api:dev
   ```

2. Em um segundo terminal, execute `npm run dev`.
3. Abra `/perfil.html` e crie uma conta.

A API fica vinculada a `127.0.0.1:4000`. Os dados são gravados em `server/data/raiz-urbana.json` por padrão. O caminho pode ser alterado com `DATA_FILE`. O arquivo inclui hashes de senha e dados pessoais; mantenha-o privado e não o envie ao Git.

`CLIENT_ORIGINS` configura as origens permitidas para a API e `TRUST_PROXY_HOPS` configura proxies confiáveis. Consulte `.env.example` para os valores locais padrão. Nunca publique um segredo JWT real.

Esse armazenamento em arquivo é para desenvolvimento local, não para produção. A Vercel não mantém os arquivos locais da API entre execuções serverless.

### Conta local no navegador

Para testar sem iniciar a API, defina `VITE_BROWSER_ACCOUNTS=true` antes de iniciar o Vite:

**PowerShell**

```powershell
$env:VITE_BROWSER_ACCOUNTS = 'true'
npm run dev
```

**macOS/Linux**

```bash
VITE_BROWSER_ACCOUNTS=true npm run dev
```

Esse modo também é ativado automaticamente nos builds da Vercel. Perfil e dados de conta são criptografados e ficam no armazenamento local do navegador; a senha original não é salva. A conta existe apenas naquele navegador e endereço do site. Não há sincronização entre dispositivos, e apagar os dados do navegador apaga a conta.

## Formulário de interesse

O formulário no fim da página inicial envia e-mails ao [Formspree](https://formspree.io/f/xeaawgoz). Quem administra esse formulário pode consultar os cadastros na conta Formspree associada. A aplicação não guarda uma cópia desses e-mails. O endpoint deve estar ativo e confirmado na conta Formspree para receber envios.

## Publicação na Vercel

O projeto usa Vite; a configuração de publicação está em `vercel.json`. A Vercel executa `npm run build` e publica `dist/`. Para publicar pela CLI:

```bash
npx vercel
npx vercel --prod
```

Na Vercel, as contas usam o modo local do navegador descrito acima. Isso é adequado para demonstração, não para oferecer contas sincronizadas ou armazenamento centralizado a usuários reais. Para produção, seria necessário conectar a aplicação a uma API e banco persistentes.

## Privacidade e demonstração

- O login pela API local usa senha com hash bcrypt e sessão protegida por cookie.
- No modo de conta do navegador, os dados são criptografados antes de serem salvos localmente.
- O formulário de interesse envia o e-mail ao Formspree.
- O CRUD visitante salva conteúdo em uma API pública e guarda os identificadores no navegador atual; não inclua dados pessoais nos exemplos.
- As condições climáticas vêm da Open-Meteo e são estimativas de modelos, não medições locais. Mapas esquemáticos e iniciativas sem login são demonstrativos; não há monitoramento automático de atividade ou localização.

Antes de coletar dados de usuários reais, publique uma política de privacidade adequada à LGPD e defina procedimentos de retenção, exclusão, segurança e atendimento aos titulares.

## Antes da entrega acadêmica

- Acrescente evidência real e anonimizada de validação com cidadãos, se exigida pela turma.
- Confirme o acesso dos avaliadores ao repositório e à publicação informada.
- Revise a divisão por disciplina conforme o formato exigido pela turma.
