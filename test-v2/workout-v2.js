'use strict';

// Incremental UI layer for the approved workout-flow improvements.
// The original app.js remains untouched; this file only overrides the
// presentation/interaction points that need to change.

const pbOriginalGo = go;
const pbNavStack = [];

go = function(screen, opts = {}) {
  if (screen !== currentScreen && !opts.__pbBack) {
    pbNavStack.push({ screen: currentScreen, week: selectedWeek, day: selectedDay });
    if (pbNavStack.length > 30) pbNavStack.shift();
  }
  const cleanOpts = Object.assign({}, opts);
  delete cleanOpts.__pbBack;
  pbOriginalGo(screen, cleanOpts);
};

function pbBack() {
  const prev = pbNavStack.pop();
  if (prev) {
    selectedWeek = prev.week || selectedWeek;
    selectedDay = prev.day || selectedDay;
    pbOriginalGo(prev.screen, { week: selectedWeek, day: selectedDay });
    return;
  }

  if (currentScreen === 'settings') pbOriginalGo('log');
  else if (currentScreen === 'workout') pbOriginalGo(selectedDay ? 'day' : 'home');
  else if (currentScreen === 'day') pbOriginalGo('week');
  else if (currentScreen === 'week') pbOriginalGo('plan');
  else pbOriginalGo('home');
}

screenHeader = function(title, sub = '', right = '') {
  let action = '';
  let icon = '';
  let label = '';

  if (currentScreen === 'log') {
    icon = '⚙';
    action = "go('settings')";
    label = 'Configurações';
  } else if (['week', 'day', 'workout', 'settings'].includes(currentScreen)) {
    icon = '←';
    action = 'pbBack()';
    label = 'Voltar';
  }

  return `<div class="topbar"><div><div class="eyebrow">${sub}</div><h1 class="title">${title}</h1></div>${icon ? `<button class="iconBtn" type="button" aria-label="${label}" onclick="${action}">${icon}</button>` : ''}</div>`;
};

function pbDisplayLog(x) {
  return state.logs[x.id] || {
    sets: Array.from({ length: Number(x.sets) || 1 }, (_, i) => ({
      set: i + 1,
      weight: x.plannedWeight || '',
      reps: x.reps || '',
      rpe: '',
      done: false
    })),
    notes: '',
    completed: false,
    date: null
  };
}

function pbEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function pbTrashIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m7 7 1 13h8l1-13"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>';
}

function pbStandardSetRow(x, s, i) {
  return `<tr class="${s.done ? 'doneRow' : ''}"><td>${i + 1}</td><td><input inputmode="decimal" value="${pbEscape(s.weight)}" onchange="updateSet('${x.id}',${i},'weight',this.value)"></td><td><input inputmode="numeric" value="${pbEscape(s.reps)}" onchange="updateSet('${x.id}',${i},'reps',this.value)"></td><td><input inputmode="decimal" value="${pbEscape(s.rpe)}" onchange="updateSet('${x.id}',${i},'rpe',this.value)"></td><td><button class="setDoneBtn" type="button" aria-label="Marcar set ${i + 1} como concluído" onclick="toggleSetDone('${x.id}',${i})">✓</button></td></tr>`;
}

function pbExtraSetRow(x, s, i) {
  return `<tr class="${s.done ? 'doneRow' : ''}"><td class="swipeCell" colspan="5"><div class="swipeWrap" data-set-id="${x.id}" data-set-index="${i}"><button class="swipeDelete" type="button" aria-label="Eliminar set ${i + 1}" onclick="deleteExtraSet('${x.id}',${i})">${pbTrashIcon()}</button><div class="swipeContent"><div class="setLabelCell">${i + 1}</div><div><input inputmode="decimal" value="${pbEscape(s.weight)}" onchange="updateSet('${x.id}',${i},'weight',this.value)"></div><div><input inputmode="numeric" value="${pbEscape(s.reps)}" onchange="updateSet('${x.id}',${i},'reps',this.value)"></div><div><input inputmode="decimal" value="${pbEscape(s.rpe)}" onchange="updateSet('${x.id}',${i},'rpe',this.value)"></div><div><button class="setDoneBtn" type="button" aria-label="Marcar set ${i + 1} como concluído" onclick="toggleSetDone('${x.id}',${i})">✓</button></div></div></div></td></tr>`;
}

function pbExerciseCard(x, index, total) {
  const log = pbDisplayLog(x);
  const plannedSets = Number(x.sets) || 1;
  const rows = (log.sets || []).map((s, i) => i >= plannedSets ? pbExtraSetRow(x, s, i) : pbStandardSetRow(x, s, i)).join('');
  const best = bestSet(log).e;
  const volume = actualVolume(log);
  const ctx = prContext(x, best);
  const percentLine = ctx.pctRef ? `<span class="pill">${ctx.pctRef}% do ${ctx.main}</span>` : '';
  const prPreview = ctx.isPr ? '<span class="pill prBadge">Novo e1RM PR</span>' : '';

  return `<div class="card workoutExerciseCard ${log.completed ? 'exerciseSaved' : ''}"><div class="row"><div><p>Exercício ${index + 1} de ${total}</p><h3>${x.exercise}</h3><p>Planeado: ${x.sets}×${x.reps}${x.plannedWeight ? ' · ' + kg(x.plannedWeight) : ''}</p></div><span class="pill">RPE ${x.targetRpe || '—'}</span></div><div class="chiprow"><span class="pill">${x.type}</span><span class="pill">${ctx.main}</span>${percentLine}${prPreview}</div>${x.notes ? `<p>${x.notes}</p>` : ''}<table class="setTable workoutSetTable"><thead><tr><th>Set</th><th>Kg</th><th>Reps</th><th>RPE</th><th>✓</th></tr></thead><tbody>${rows}</tbody></table><button class="secondary compactAction" type="button" onclick="addSet('${x.id}')">+ Adicionar Set</button><div class="grid2 workoutMetrics"><div><p>e1RM estimado</p><div class="smallMetric">${kg(best)}</div><p class="miniNote">PR exercício: ${ctx.exBest ? kg(ctx.exBest) : '—'}</p></div><div><p>Tonelagem</p><div class="smallMetric">${kg(volume)}</div><p class="miniNote">Dif. planeado: ${kg(volume - (Number(x.plannedTonnage) || 0))}</p></div></div><div class="field"><label>Notas</label><textarea onchange="updateNotes('${x.id}',this.value)">${pbEscape(log.notes || '')}</textarea></div><button class="primary compactAction" type="button" onclick="completeExercise('${x.id}')">Guardar exercício</button>${log.completed ? '<div class="savedLine"><span class="statusDot done"></span><span>Guardado</span></div>' : ''}</div>`;
}

renderWorkout = function() {
  const w = selectedWeek || state.settings.currentWeek || 1;
  if (!selectedDay) selectedDay = (daysForWeek(w)[0] || {}).day;
  const items = dayItems(w, selectedDay);

  if (!items.length) {
    app.innerHTML = screenHeader('Treino', 'Escolhe uma semana') + '<button class="primary" onclick="go(\'plan\')">Ir para o plano</button>';
    return;
  }

  app.innerHTML = screenHeader(`Semana ${w}`, `${selectedDay} · ${dayName(items)}`) +
    `<div class="workoutList">${items.map((x, i) => pbExerciseCard(x, i, items.length)).join('')}</div>` +
    `<div class="card workoutTimerCard"><p>Descanso</p><div class="timer" id="timerText">${fmtTime(restSeconds)}</div><div class="segmented"><button onclick="setRest(90)">90s</button><button onclick="setRest(180)">3m</button><button onclick="setRest(300)">5m</button></div><button class="secondary" onclick="toggleTimer()">Iniciar / Pausar timer</button></div>` +
    `<button class="primary compactAction finishWorkoutBtn" type="button" onclick="finishWorkout()">Concluir treino</button>`;

  bindWorkoutSwipe();
};

function pbRerenderAtScroll() {
  const y = window.scrollY;
  renderWorkout();
  requestAnimationFrame(() => window.scrollTo(0, y));
}

updateSet = function(id, i, k, v) {
  const l = ensureLog(id);
  if (!l.sets[i]) return;
  l.sets[i][k] = v;
  if (l.completed) l.completed = false;
  save();
  pbRerenderAtScroll();
};

updateNotes = function(id, v) {
  const l = ensureLog(id);
  l.notes = v;
  if (l.completed) l.completed = false;
  save();
  pbRerenderAtScroll();
};

addSet = function(id) {
  const l = ensureLog(id);
  l.sets.push({ set: l.sets.length + 1, weight: '', reps: '', rpe: '', done: false });
  if (l.completed) l.completed = false;
  save();
  pbRerenderAtScroll();
};

function toggleSetDone(id, i) {
  const l = ensureLog(id);
  if (!l.sets[i]) return;
  l.sets[i].done = !l.sets[i].done;
  save();
  pbRerenderAtScroll();
}

function deleteExtraSet(id, i) {
  const x = DATA.plan.find(p => p.id === id);
  const l = ensureLog(id);
  if (!x || i < (Number(x.sets) || 1) || !l.sets[i]) return;
  l.sets.splice(i, 1);
  l.sets.forEach((s, idx) => { s.set = idx + 1; });
  if (l.completed) l.completed = false;
  save();
  pbRerenderAtScroll();
  toast('Set eliminado');
}

completeExercise = function(id) {
  const l = ensureLog(id);
  l.completed = true;
  l.date = new Date().toISOString();
  saveSessionFor(id);
  const prs = evaluatePRs(id);
  queueExerciseSync(id, prs);
  save();
  if (state.settings.autoSync && syncConfigured()) syncPending(false);
  pbRerenderAtScroll();
  toast(prs.length ? `Novo PR: ${prs[0].name} ${kg(prs[0].value)}` : 'Exercício guardado');
};

function finishWorkout() {
  const w = selectedWeek || state.settings.currentWeek || 1;
  const items = dayItems(w, selectedDay);
  const missing = items.filter(x => !state.logs[x.id]?.completed);

  if (missing.length) {
    toast(missing.length === 1 ? `Falta guardar: ${missing[0].exercise}` : `${missing.length} exercícios por guardar`);
    return;
  }

  toast('Treino concluído');
  go('log');
}

function bindWorkoutSwipe() {
  document.querySelectorAll('.swipeWrap').forEach(el => {
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    const begin = x => {
      startX = x;
      currentX = x;
      dragging = true;
    };
    const move = x => {
      if (dragging) currentX = x;
    };
    const end = () => {
      if (!dragging) return;
      const dx = currentX - startX;
      if (dx < -35) el.classList.add('revealed');
      if (dx > 25) el.classList.remove('revealed');
      dragging = false;
    };

    el.addEventListener('touchstart', e => {
      if (e.target.closest('input,button')) return;
      if (e.touches[0]) begin(e.touches[0].clientX);
    }, { passive: true });
    el.addEventListener('touchmove', e => {
      if (e.touches[0]) move(e.touches[0].clientX);
    }, { passive: true });
    el.addEventListener('touchend', end);

    el.addEventListener('mousedown', e => {
      if (e.target.closest('input,button')) return;
      begin(e.clientX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => move(e.clientX));
    window.addEventListener('mouseup', end);
  });
}

// Re-render once after the base app has loaded so the header rules take effect
// immediately on the initial Home screen.
render();
