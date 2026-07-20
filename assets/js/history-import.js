'use strict';

function sheetsImportDate(row) {
  const value = String(row.timestamp || row.date || '').trim();
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  const date = String(row.date || '').slice(0, 10);
  return date ? `${date}T12:00:00.000Z` : new Date().toISOString();
}

function mergeSheetsWorkoutRows(rows) {
  const grouped = new Map();

  for (const row of rows || []) {
    const sourceId = String(row.sourceId || '').trim();
    if (!sourceId) continue;
    if (!grouped.has(sourceId)) grouped.set(sourceId, []);
    grouped.get(sourceId).push(row);
  }

  let importedExercises = 0;

  for (const [sourceId, exerciseRows] of grouped.entries()) {
    exerciseRows.sort((a, b) => (Number(a.setNumber) || 0) - (Number(b.setNumber) || 0));

    const first = exerciseRows[0] || {};
    const existing = state.logs[sourceId] || {};
    const importedAt = sheetsImportDate(first);

    state.logs[sourceId] = {
      sets: exerciseRows.map((row, index) => ({
        set: Number(row.setNumber) || index + 1,
        weight: row.actualWeight === '' ? '' : row.actualWeight,
        reps: row.actualReps === '' ? '' : row.actualReps,
        rpe: row.actualRpe === '' ? '' : row.actualRpe
      })),
      notes: first.notes || existing.notes || '',
      completed: String(first.status || '').toLowerCase() !== 'draft',
      date: importedAt,
      importedFromSheets: true
    };

    const date = String(first.date || importedAt.slice(0, 10)).slice(0, 10);
    const week = Number(first.week) || first.week || '';
    const day = first.day || '';
    const sessionKey = `${date}|${week}|${day}`;
    let session = state.sessions.find(item => item.key === sessionKey);

    if (!session) {
      session = {
        key: sessionKey,
        date,
        week,
        day,
        name: first.workout || dayName(dayItems(week, day)),
        exerciseIds: [],
        importedFromSheets: true
      };
      state.sessions.push(session);
    }

    if (!session.exerciseIds.includes(sourceId)) session.exerciseIds.push(sourceId);
    importedExercises += 1;
  }

  state.sessions.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return importedExercises;
}

function mergeSheetsPrRows(rows) {
  const existingById = new Map((state.prs || []).map(pr => [String(pr.id), pr]));

  for (const row of rows || []) {
    const id = String(row.prId || '').trim();
    if (!id) continue;

    const imported = {
      id,
      date: sheetsImportDate(row),
      week: Number(row.week) || row.week || '',
      day: row.day || '',
      lift: row.lift || '',
      exercise: row.exercise || '',
      name: row.exercise || row.lift || 'PR',
      type: row.prType || '',
      value: Number(row.value) || 0,
      unit: row.unit || 'kg',
      previous: row.previous === '' ? null : Number(row.previous),
      meta: row.detail || '',
      sourceId: row.sourceId || '',
      importedFromSheets: true
    };

    existingById.set(id, { ...(existingById.get(id) || {}), ...imported });
  }

  state.prs = Array.from(existingById.values())
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 500);

  state.records = {};
  for (const pr of state.prs.slice().reverse()) {
    const key = recordKey(pr.type, pr.name);
    const previous = state.records[key];
    if (!previous || Number(pr.value) > Number(previous.value || 0)) state.records[key] = pr;
  }

  return (rows || []).length;
}

async function importFromSheets() {
  if (!syncConfigured()) {
    toast('Configura primeiro o URL do Google Sheets');
    return;
  }

  const button = document.getElementById('importSheetsBtn');
  if (button) {
    button.disabled = true;
    button.textContent = 'A importar…';
  }

  try {
    const url = new URL(sheetUrl());
    url.searchParams.set('action', 'all');
    url.searchParams.set('_', Date.now());

    const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Resposta inválida');

    const workoutRows = data.workouts?.rows || [];
    const prRows = data.prs?.rows || [];
    const importedExercises = mergeSheetsWorkoutRows(workoutRows);
    const importedPrs = mergeSheetsPrRows(prRows);

    state.settings.lastImport = new Date().toISOString();
    state.settings.lastSync = new Date().toISOString();
    save();

    toast(`${state.sessions.length} treino(s) disponíveis`);
    render();

    console.info('Importação concluída', {
      workoutRows: workoutRows.length,
      importedExercises,
      importedPrs,
      sessions: state.sessions.length
    });
  } catch (error) {
    console.error('Falha na importação do Sheets', error);
    toast('Falha ao importar do Google Sheets');
    if (button) {
      button.disabled = false;
      button.textContent = 'Importar histórico do Sheets';
    }
  }
}

function enhanceSheetsSettings() {
  const urlInput = document.querySelector('input[placeholder*="script.google.com/macros"]');
  if (!urlInput || document.getElementById('importSheetsBtn')) return;

  const card = urlInput.closest('.card');
  if (!card) return;

  const syncButton = Array.from(card.querySelectorAll('button')).find(button =>
    button.textContent.includes('Sincronizar agora') || button.textContent.includes('Enviar pendentes')
  );

  const importButton = document.createElement('button');
  importButton.id = 'importSheetsBtn';
  importButton.type = 'button';
  importButton.className = 'secondary';
  importButton.textContent = 'Importar histórico do Sheets';
  importButton.addEventListener('click', importFromSheets);

  if (syncButton) syncButton.insertAdjacentElement('afterend', importButton);
  else card.appendChild(importButton);

  const note = document.createElement('p');
  note.className = 'miniNote';
  note.id = 'lastSheetsImport';
  note.textContent = state.settings.lastImport
    ? `Última importação: ${new Date(state.settings.lastImport).toLocaleString('pt-PT')}.`
    : 'Última importação: nunca.';
  importButton.insertAdjacentElement('afterend', note);
}

const settingsObserver = new MutationObserver(enhanceSheetsSettings);
settingsObserver.observe(document.getElementById('app'), { childList: true, subtree: true });
enhanceSheetsSettings();
