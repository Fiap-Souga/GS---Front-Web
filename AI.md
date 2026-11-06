# Uso de inteligência artificial

Este projeto foi desenvolvido com apoio de um assistente de IA integrado ao VS Code (Copilot SDK).

## Como a IA foi utilizada

- Apoio na revisão da estrutura e na preparação do projeto Vite para a entrega.
- Implementação assistida do painel React de iniciativas comunitárias, hooks, integração demonstrativa com JSONPlaceholder e testes automatizados.
- Implementação assistida do cadastro e login, com hash de senha, sessão segura, persistência local em JSON para perfis, árvore e planos, e testes.
- Apoio na revisão da documentação, investigação de erros e execução de build e testes.

## Exemplos representativos de interação

- Prompt: “Utilizar o MongoDB para criar um banco de dados de usuários que digitam o login e a senha e criam o seu próprio plano com sua árvore e perfil.”
- Resposta aplicada: criação do cadastro/login e persistência de perfil, árvore e planos associados ao usuário. Após a decisão de usar um arquivo local, a persistência foi implementada em JSON, sem armazenar senhas em texto puro.
- Prompt: “Failed to execute 'json' on 'Response': Unexpected end of JSON input.”
- Resposta aplicada: identificação da API local desligada como causa provável e implementação de mensagens claras para respostas vazias ou JSON inválido.

## Validação, análise crítica e limites

As alterações foram verificadas com `npm test` e `npm run build`. A senha é armazenada como hash bcrypt; a sessão web utiliza cookie HttpOnly com proteção CSRF. As operações de perfil, árvore e planos têm testes automatizados.

A persistência JSON é somente local: o arquivo fica em `server/data/raiz-urbana.json` e a API escuta apenas em loopback. Isso evita um serviço de banco hospedado, mas não permite que pessoas na internet acessem o computador nem oferece garantias de concorrência, disponibilidade ou backup de um banco de produção. O arquivo precisa ser mantido privado e protegido. O JSONPlaceholder sem login continua simulando gravações, e as métricas de hábitos seguem fictícias. Não há integração com totens nem monitoramento de localização.

A IA acelerou a implementação e a criação de testes, mas não valida sozinha a configuração do computador nem substitui revisão humana. A solução local não deve ser usada para coletar contas de usuários remotos. O limitador de tentativas é em memória e ainda não há recuperação de senha, confirmação de e-mail ou exclusão de conta.
