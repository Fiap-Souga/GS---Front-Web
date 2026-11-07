# Registro de prompts de IA

Este arquivo registra interações representativas usadas no desenvolvimento. Não é uma transcrição integral do histórico.

| Prompt | Uso no projeto |
|---|---|
| “Utilizar o MongoDB para criar um banco de dados de usuários que digitam o login e a senha e criam o seu próprio plano com sua árvore e perfil.” | Orientou o desenho inicial de contas, perfil e planos. A persistência entregue para a API local usa JSON, e a versão publicada usa armazenamento cifrado no navegador. |
| “Quando a pessoa entrar no perfil, que consiga alterar e adicionar coisas; deixe tudo zerado para novos usuários e faça um tutorial.” | Orientou os formulários de perfil, os estados vazios e o tour guiado. |
| “Quero apenas que o usuário consiga colocar login e senha para ver os dados dele sem precisar abrir outro app.” | Orientou o fluxo de autenticação integrado à página de perfil. |
| “Poderia fazer isso então? Fazer o CRUD e todas as pendências para a atividade ficar 100%.” | Orientou a implementação de CRUD visitante com API pública de demonstração e a conclusão das pendências documentais verificáveis. |

As respostas e limitações técnicas estão descritas em [AI.md](./AI.md). A integração visitante grava ações em uma API pública; o índice fica no navegador atual, e os registros externos não são privados. O indicador e os ODS registrados são as sugestões aceitas pela equipe, não uma medição de impacto. A pesquisa com cidadãos deve ser real e está pendente.
