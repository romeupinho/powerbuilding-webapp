'use strict';

screenHeader = function(title, sub = '', right = '') {
  const showBack = ['week', 'day', 'workout', 'settings'].includes(currentScreen);
  const showSettings = currentScreen === 'log';

  const backButton = showBack
    ? '<button class="iconBtn" type="button" aria-label="Voltar" onclick="pbBack()">←</button>'
    : '';

  const settingsButton = showSettings
    ? '<button class="iconBtn" type="button" aria-label="Configurações" onclick="go(\'settings\')">⚙</button>'
    : '';

  return `<div class="topbar"><div class="topbarLeft">${backButton}<div><div class="eyebrow">${sub}</div><h1 class="title">${title}</h1></div></div>${settingsButton}</div>`;
};

render();
