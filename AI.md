# Uso de inteligência artificial

Este projeto foi desenvolvido com apoio de um assistente de IA integrado ao VS Code (Copilot SDK).

## Como a IA foi utilizada

- Apoio na revisão da estrutura e na preparação do projeto Vite para a entrega.
- Implementação assistida do painel React de iniciativas comunitárias, hooks, atividades de demonstração em português e testes automatizados.
- Implementação assistida do cadastro e login, com hash de senha, sessão segura, persistência local em JSON para perfis, árvore e planos, e testes.
- Integração do CRUD visitante de ações com uma API pública RESTful; os registros ficam no serviço externo, com o índice de IDs salvo apenas no navegador e sem dados pessoais.
- Polimento do perfil pessoal: tour guiado interativo, métricas pessoais vazias até serem registradas, resumo visual semanal e exportação CSV dos registros diários de hábitos.
- Modo demonstrativo de contas locais na Vercel, com perfil, árvore, hábitos e planos cifrados no navegador; a senha não é transmitida nem armazenada.
- Apoio na revisão da documentação, investigação de erros e execução de build e testes.

## Exemplos representativos de interação

- Prompt: “Utilizar o MongoDB para criar um banco de dados de usuários que digitam o login e a senha e criam o seu próprio plano com sua árvore e perfil.”
- Resposta aplicada: criação do cadastro/login e persistência de perfil, árvore e planos associados ao usuário. Após a decisão de usar um arquivo local, a persistência foi implementada em JSON, sem armazenar senhas em texto puro.
- Prompt: “Failed to execute 'json' on 'Response': Unexpected end of JSON input.”
- Resposta aplicada: identificação da API local desligada como causa provável e implementação de mensagens claras para respostas vazias ou JSON inválido.
- Prompt: “Quando a pessoa entrar no perfil, que consiga alterar e adicionar coisas; deixe tudo zerado para novos usuários e faça um tutorial.”
- Resposta aplicada: separação entre demonstração e conta pessoal, persistência isolada de hábitos no JSON, tour pelas seções de perfil, gráfico semanal e exportação de registros.
- Prompt: “Quero apenas que o usuário consiga colocar login e senha para ver os dados dele sem precisar abrir outro app.”
- Resposta aplicada: para a versão Vercel, contas e dados isolados por navegador, cifrados com chave derivada da senha. Este modo não sincroniza contas com o computador local ou com outros dispositivos.
- Prompt: “Poderia fazer isso então? Fazer o CRUD e todas as pendências para a atividade ficar 100%.”
- Resposta aplicada: integração visitante com `GET`, `POST`, `PUT` e `DELETE` da RESTful API; documentação da ficha, limitações do protótipo e registro de prompts. A equipe confirmou as sugestões de indicador/ODS e forneceu a URL publicada; a evidência de pesquisa com cidadãos continua pendente.

## Validação, análise crítica e limites

As alterações foram verificadas com `npm test` e `npm run build`. A senha é armazenada como hash bcrypt; a sessão web utiliza cookie HttpOnly com proteção CSRF. As operações de perfil, hábitos, árvore, planos e tour têm testes automatizados.

A persistência JSON é somente local: o arquivo fica em `server/data/raiz-urbana.json` e a API escuta apenas em loopback. A versão Vercel usa um modo de demonstração separado, com contas e dados cifrados no armazenamento do navegador; não há sincronização com o computador local ou outros dispositivos. Limpar os dados do navegador apaga essas contas, e esse mecanismo não substitui autenticação centralizada para produção. As ações de visitantes são gravadas em uma API pública externa, mas sua lista de identificadores fica no navegador atual; registros acessíveis por ID não são privados e não sincronizam entre dispositivos. Apagar o armazenamento do navegador também remove a lista de IDs, não os objetos externos. O formulário avisa para não enviar dados pessoais. Contas autenticadas têm registros de hábitos pessoais que só aparecem após serem adicionados manualmente. Não há integração com totens nem monitoramento de localização.

A IA acelerou a implementação e a criação de testes, mas não valida sozinha a configuração do computador nem substitui revisão humana. A solução local não deve ser usada para coletar contas de usuários remotos. O limitador de tentativas é em memória e ainda não há recuperação de senha, confirmação de e-mail ou exclusão de conta.
