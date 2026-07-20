/**
 * Powerbuilding 12 Semanas - Google Sheets Sync Endpoint
 *
 * Como usar:
 * 1) Abre o teu Google Sheets.
 * 2) Extensions / Extensões > Apps Script.
 * 3) Cola este código em Code.gs.
 * 4) Deploy > New deployment > Web app.
 * 5) Execute as: Me / Eu.
 * 6) Who has access: Anyone / Qualquer pessoa.
 * 7) Copia o Web app URL terminado em /exec.
 * 8) Cola esse URL na app: Configurações > Google Sheets.
 */

const APP_LOG_SHEET = 'App_Log';
const PR_LOG_SHEET = 'PR_Log';

const APP_LOG_HEADERS = [
  'Row_ID', 'Timestamp_App', 'Data_Treino', 'Semana', 'Dia', 'Workout', 'Lift',
  'Exercicio', 'Tipo', 'Serie', 'Sets_Planeados', 'Reps_Planeadas', 'Percent_Ref',
  'Peso_Planeado', 'Peso_Feito', 'Reps_Feitas', 'RPE_Feito', 'e1RM', 'Tonelagem',
  'Notas', 'Estado', 'Source_ID', 'Device_ID', 'Updated_At'
];

const PR_LOG_HEADERS = [
  'PR_ID', 'Timestamp_App', 'Data', 'Semana', 'Dia', 'Lift', 'Exercicio',
  'Tipo_PR', 'Valor', 'Unidade', 'Anterior', 'Detalhe', 'Source_ID', 'Device_ID',
  'Updated_At'
];

function doGet() {
  ensureSheet_(APP_LOG_SHEET, APP_LOG_HEADERS);
  ensureSheet_(PR_LOG_SHEET, PR_LOG_HEADERS);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'Powerbuilding sync endpoint ativo.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(body);
    const type = data.type;
    const rows = data.payload && data.payload.rows ? data.payload.rows : [];

    if (type === 'workout_rows') {
      const sheet = ensureSheet_(APP_LOG_SHEET, APP_LOG_HEADERS);
      rows.forEach(row => upsertById_(sheet, APP_LOG_HEADERS, String(row.rowId || ''), mapWorkoutRow_(row)));
    }

    if (type === 'pr_rows') {
      const sheet = ensureSheet_(PR_LOG_SHEET, PR_LOG_HEADERS);
      rows.forEach(row => upsertById_(sheet, PR_LOG_HEADERS, String(row.prId || ''), mapPrRow_(row)));
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, type, rows: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err && err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeaders = current.join('') === '' || current[0] !== headers[0];
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function upsertById_(sheet, headers, id, values) {
  if (!id) return;
  const idCol = 1;
  const lastRow = sheet.getLastRow();
  let targetRow = -1;

  if (lastRow >= 2) {
    const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues().flat().map(String);
    const idx = ids.indexOf(id);
    if (idx !== -1) targetRow = idx + 2;
  }

  if (targetRow === -1) targetRow = lastRow + 1;
  sheet.getRange(targetRow, 1, 1, headers.length).setValues([values]);
}

function mapWorkoutRow_(r) {
  return [
    r.rowId || '',
    r.timestamp || '',
    r.date || '',
    r.week || '',
    r.day || '',
    r.workout || '',
    r.lift || '',
    r.exercise || '',
    r.type || '',
    r.setNumber || '',
    r.plannedSets || '',
    r.plannedReps || '',
    r.percentRef || '',
    r.plannedWeight || '',
    r.actualWeight || '',
    r.actualReps || '',
    r.actualRpe || '',
    r.e1rm || '',
    r.tonnage || '',
    r.notes || '',
    r.status || '',
    r.sourceId || '',
    r.deviceId || '',
    new Date()
  ];
}

function mapPrRow_(r) {
  return [
    r.prId || '',
    r.timestamp || '',
    r.date || '',
    r.week || '',
    r.day || '',
    r.lift || '',
    r.exercise || '',
    r.prType || '',
    r.value || '',
    r.unit || '',
    r.previous || '',
    r.detail || '',
    r.sourceId || '',
    r.deviceId || '',
    new Date()
  ];
}
