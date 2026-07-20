# Contexto do projeto — Powerbuilding Web App até V1.3

## Objetivo
Criar uma web app/PWA mobile-first para Android, com design dark, clean e user-friendly inspirado na app Dropset, usando como base um Excel/Google Sheets de plano de powerbuilding de 12 semanas.

A app deve permitir:
- consultar o plano de treino por semana/dia;
- iniciar treinos;
- inserir peso, reps, RPE e notas;
- calcular tonelagem, e1RM, PRs e percentagens;
- manter histórico das 12 semanas;
- sincronizar os dados para Google Sheets;
- funcionar primeiro localmente e depois sincronizar quando houver internet.

## Ficheiro original
Excel usado como base:
`Powerbuilding_12_Semanas_Corrigido_Realista(1).xlsx`

Folhas identificadas:
- Config
- Master_Log
- Semana_01 a Semana_12
- Dashboard
- Progressao
- Teste_Semana12
- Instruções
- PR_Log

Campos principais do plano:
- Semana
- Dia
- Lift
- Exercício
- Tipo
- Sets
- Reps
- %1RM / Ref
- Peso Planeado
- Peso Feito
- Reps Feitas
- RPE Feito
- e1RM
- Tonelagem Planeada
- Notas

## Direção visual aprovada
Referência visual: Dropset Gym Tracker.

Estilo aprovado:
- dark mode premium;
- background quase preto;
- cards grandes e arredondados;
- bordas subtis translúcidas;
- tipografia grande e bold;
- inputs grandes para uso no ginásio;
- navegação inferior fixa em formato pill;
- ícones outline minimalistas;
- interface mobile-first.

Design system proposto:
- Background principal: #050509
- Background secundário: #0B0B10
- Card principal: #1C1C22
- Card elevado: #24242B
- Border: rgba(255,255,255,0.08)
- Texto principal: #FFFFFF
- Texto secundário: #A0A0AA
- Texto apagado: #5D5D66
- Sucesso/PR: #7CFF9B
- Aviso/RPE alto: #FFB86B
- Erro/falha: #FF6B6B

Tipografia:
`Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

## Arquitetura de produto aprovada
Navegação principal:
- Home
- Plano
- Treino
- Dashboard/Stats
- Log

Ecrãs definidos:
1. Home
2. Plano 12 semanas
3. Detalhe da semana
4. Detalhe do dia
5. Treino ativo
6. Timer de descanso
7. Dashboard
8. Semana 12 / Testes
9. Histórico / Log
10. PR Log
11. Configurações

Fluxo central:
Plano planeado → Treino ativo → Registo feito → Dashboard atualizado → Histórico / PR Log → Sync Google Sheets

## Funcionalidades V1
A V1 gerada incluiu:
- plano completo das 12 semanas embutido na app;
- navegação mobile-first;
- Home, Plano, Semana, Dia, Treino ativo, Dashboard, Histórico, Configurações;
- registo de peso/reps/RPE/notas;
- cálculo de tonelagem e e1RM;
- histórico em localStorage;
- exportação CSV;
- backup/importação JSON;
- manifest e service worker para PWA.

## Funcionalidades V1.1
Adicionada lógica de PRs:
- deteção automática de PR por e1RM;
- deteção de peso máximo por exercício;
- deteção de volume PR por exercício;
- atualização do melhor e1RM por lift principal: Squat, Bench, Deadlift, OHP;
- atualização do dashboard com percentagem em relação ao objetivo;
- badge “Novo PR” durante o treino;
- PR Log no Dashboard e Histórico;
- exportação separada de workout_logs.csv e pr_log.csv;
- percentagem do peso planeado contra referência atual do lift.

## Funcionalidades V1.2
Atualizada a barra de navegação:
- Home: ícone House outline;
- Plano: Dumbbell outline;
- Treino: Plus central mantido;
- Stats: ChartLine outline;
- Log: User/Profile outline;
- todos no mesmo estilo minimalista/outline;
- barra em formato pill com fundo translúcido e borda arredondada.

O utilizador aprovou exatamente esta barra.

## Funcionalidades V1.3
Adicionada sincronização com Google Sheets via Google Apps Script.

Ficheiros incluídos no ZIP V1.3:
- `index.html`
- `Code.gs`
- `README_GOOGLE_SHEETS.txt`

Comportamento pretendido:
- a app guarda sempre primeiro no telemóvel/localStorage;
- se houver URL de Apps Script configurado e internet, envia os dados para Google Sheets;
- se estiver offline, mantém pendentes e sincroniza depois;
- botão “Sincronizar agora”;
- auto-sync ON/OFF;
- estado configurado/pendentes na app.

Folhas de destino no Google Sheets:
- App_Log
- PR_Log

App_Log deve receber:
- Data
- Semana
- Dia
- Workout
- Lift
- Exercício
- Tipo
- Série
- Peso planeado
- Peso feito
- Reps feitas
- RPE feito
- e1RM
- Tonelagem
- Notas

PR_Log deve receber:
- Data
- Semana
- Lift
- Exercício
- Tipo de PR
- Valor
- Anterior
- Detalhe

## Google Apps Script
O utilizador criou um Apps Script dentro do Google Sheets.
Foi explicado que o código default:
`function myFunction() {}`
devia ser apagado completamente, e o conteúdo integral de `Code.gs` colado diretamente no editor.

Deploy/Implementar:
- Implementar = Deploy;
- Nova implementação;
- Tipo: Aplicação Web;
- Executar como: Eu;
- Quem tem acesso: Qualquer pessoa;
- copiar URL terminado em `/exec`.

URL configurado pelo utilizador:
`[REMOVIDO — configurar manualmente na app]`

A app mostrou:
- “Google Sheets”
- “Sincronizado”
- URL configurado
- badge “Configurado”
- “0 pendente(s)”
- “Auto-sync ON”
- botão “Sincronizar agora”

Isto indica que a interface reconheceu o URL e o estado local de sincronização.
Ainda falta validar se o Apps Script escreve efetivamente nas folhas App_Log e PR_Log após registar uma série.

## Limitações reconhecidas da V1.3
A V1.3 é um protótipo funcional/POC, mas ainda não deve ser tratada como app final de produção.

Pontos a validar/melhorar:
- confirmar escrita real no Google Sheets;
- confirmar criação automática das folhas App_Log e PR_Log;
- evitar dependência excessiva de localStorage;
- mover para IndexedDB;
- separar ficheiros em arquitetura modular;
- leitura dinâmica do plano diretamente do Google Sheets;
- evitar ter o plano embutido no index.html;
- sincronização robusta com fila offline;
- logs de erro visíveis;
- testes de permissões CORS/Apps Script;
- garantia de não duplicar linhas ao sincronizar;
- IDs únicos por log e PR;
- deduplicação no Apps Script.

## Caminho recomendado para V2/Replit
Recomenda-se parar de fazer patches sobre a V1 e criar uma V2 como projeto real no Replit.

Objetivo da V2:
A app deve ser apenas a interface bonita. O Google Sheets deve ser a base de dados/fonte de verdade.

Arquitetura recomendada:

Powerbuilding-App/
├── index.html
├── styles.css
├── app.js
├── manifest.json
├── sw.js
├── assets/
│   ├── icons/
│   └── fonts/
├── modules/
│   ├── ui.js
│   ├── router.js
│   ├── storage.js
│   ├── sync.js
│   ├── calculator.js
│   ├── workout.js
│   ├── dashboard.js
│   └── sheetsApi.js
└── appscript/
    └── Code.gs

Fluxo ideal:
Google Sheets ↔ Apps Script API ↔ Web App ↔ IndexedDB/local cache

A app deve:
- ler o plano diretamente do Google Sheets;
- escrever resultados em App_Log;
- escrever PRs em PR_Log;
- funcionar offline;
- sincronizar automaticamente quando voltar a internet;
- permitir exportação e backup;
- manter design dark premium já aprovado.

## Instrução para nova conversa/Replit
Na nova conversa, o pedido deve ser:

“Quero reconstruir a V2 desta Powerbuilding Web App no Replit. Usa este ficheiro de contexto. A app deve ser uma PWA mobile-first em HTML/CSS/JS modular, com design dark premium inspirado na Dropset. O Google Sheets será a base de dados. A app deve ler o plano do Sheets e escrever logs/PRs via Apps Script, com IndexedDB para offline cache e fila de sincronização. Começa por criar a estrutura do projeto, o schema de dados, o Apps Script robusto e depois a UI.”

## Prioridades V2
1. Criar estrutura modular no Replit.
2. Criar Apps Script robusto com endpoints:
   - GET config
   - GET plan
   - GET dashboard
   - POST workout log
   - POST PR log
   - POST batch sync
3. Criar IndexedDB/local cache.
4. Criar sync queue com status pending/synced/error.
5. Criar UI mobile-first com design aprovado.
6. Migrar dados do Excel/Sheets para formato normalizado.
7. Testar escrita real no Google Sheets.
8. Testar uso Android/PWA.

## Nota importante
O ficheiro Google Sheets não precisa ter nome específico.
O que importa é:
- estar convertido para Google Sheets, não apenas .xlsx no Drive;
- ter Apps Script vinculado;
- usar as folhas esperadas, sobretudo App_Log e PR_Log;
- o URL `/exec` estar configurado na app.

