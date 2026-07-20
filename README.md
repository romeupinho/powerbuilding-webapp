# Powerbuilding WebApp

Versão reorganizada da V1.3, preparada para publicação num repositório novo através do GitHub Pages.

## Estrutura

```text
powerbuilding-webapp/
├── index.html
├── manifest.webmanifest
├── sw.js
├── .nojekyll
├── assets/
│   ├── css/styles.css
│   ├── icons/icon.svg
│   └── js/
│       ├── data.js
│       └── app.js
├── apps-script/Code.gs
└── docs/
```

- `data.js`: plano de 12 semanas e dados estáticos.
- `app.js`: interface, navegação, treino, PRs, histórico, armazenamento e sincronização.
- `styles.css`: design original da V1.3, incluindo a barra de navegação e os seus SVG.
- `Code.gs`: backend opcional para Google Sheets.

## Compatibilidade com os dados existentes

A chave de armazenamento continua a ser `pb12_state_v1`. Ao publicar esta versão no mesmo endereço da aplicação anterior, o browser consegue continuar a ler o histórico existente. Antes da substituição, exporta também um backup JSON nas Configurações.

## Publicar no GitHub Pages

1. Criar um repositório novo e vazio.
2. Enviar **o conteúdo desta pasta** para a raiz da branch `main`.
3. Em `Settings > Pages`, selecionar `Deploy from a branch`.
4. Selecionar `main` e `/ (root)`.
5. Guardar.

Não é necessário configurar domínio personalizado.

## Teste local

Não abrir diretamente com `file://`. Na raiz do projeto:

```bash
python -m http.server 8080
```

Abrir `http://localhost:8080`.

## Google Sheets

O URL pessoal do Apps Script não está no repositório. Mantém-se configurável na própria aplicação. O backend encontra-se em `apps-script/Code.gs`.
