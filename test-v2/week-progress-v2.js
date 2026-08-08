'use strict';

function finishWorkout() {
  const w = Number(selectedWeek || state.settings.currentWeek || 1);
  const items = dayItems(w, selectedDay);
  const missing = items.filter(x => !state.logs[x.id]?.completed);

  if (missing.length) {
    toast(missing.length === 1 ? `Falta guardar: ${missing[0].exercise}` : `${missing.length} exercícios por guardar`);
    return;
  }

  let advancedWeek = false;
  const currentWeek = Number(state.settings.currentWeek || 1);

  if (w === currentWeek && w < 12) {
    const allWeekExercises = weekItems(w);
    const weekComplete = allWeekExercises.length > 0 && allWeekExercises.every(x => state.logs[x.id]?.completed);

    if (weekComplete) {
      state.settings.currentWeek = w + 1;
      save();
      advancedWeek = true;
    }
  }

  toast(advancedWeek ? `Semana ${w} concluída · Semana ${w + 1} ativa` : 'Treino concluído');
  go('log');
}
