# Raiz Urbana

Site demonstrativo de uma iniciativa que conecta áreas verdes, monitoramento climático local e participação comunitária.

## Requisitos

- Node.js 18 ou superior
- npm

## Executar localmente

```bash
npm ci
npm run dev
```

O Vite informa no terminal o endereço local para abrir no navegador.

## Páginas

- `/` — apresentação do projeto, áreas prioritárias, monitoramento e participação.
- `/perfil.html` — painel com perfis e dados demonstrativos de hábitos, visitas e crescimento de uma árvore digital.

## Build de produção

```bash
npm run build
npm run preview
```

Os arquivos de produção são gerados em `dist/`. Essa pasta e `node_modules/` não devem ser enviados ao Git: ambos podem ser recriados com os comandos acima.

## Sobre os dados

As leituras climáticas, estatísticas, perfis, afinidades e visitas exibidas são demonstrações fictícias. Não há autenticação, integração com totens, monitoramento de localização ou coleta de dados pessoais. O progresso manual da árvore digital é salvo somente no armazenamento local do navegador.

O site carrega imagens do Unsplash e fontes do Google Fonts, portanto esses recursos externos dependem de conexão com a internet.
