// TODO: update values for both mobile and desktop inputs on change
(() => {
  const CONTROLS = [
    {
      radio: '[name="setting-card"]',
      select: '#settings-select-cards',
      settingsKey: 'cardsQty',
    },
    {
      radio: '[name="setting-speed"]',
      select: '#settings-select-speed',
      settingsKey: 'speed',
    },
    {
      radio: '[name="setting-show"]',
      select: '#settings-select-show-cards',
      settingsKey: 'showCards',
    },
  ];

  const settingsElements = {
    btnEl: document.getElementById('settings-btn'),
    cancelBtnEl: document.querySelector('.settings-cancel-btn'),
    modalEl: document.querySelector('.settings'),
    overlayEl: document.querySelector('.settings-overlay'),
  };

  // SETTINGS
  const showSettingsModal = () => {
    settingsElements.modalEl.classList.add('is-shown');
    settingsElements.overlayEl.classList.add('is-shown');
  };

  const closeSettingsModal = () => {
    settingsElements.modalEl.classList.remove('is-shown');
    settingsElements.overlayEl.classList.remove('is-shown');
  };

  const onRadioChange = (ev) => {
    const radioEl = ev.currentTarget;
    const selectEl = settingsElements.modalEl.querySelector(
      radioEl.dataset.selectorSelect
    );

    window.gameSettings[radioEl.dataset.settingsKey] = radioEl.value;

    selectEl.value = radioEl.value;
  };

  const onSelectChange = (ev) => {
    const selectEl = ev.currentTarget;
    const radioEls = settingsElements.modalEl.querySelectorAll(
      selectEl.dataset.selectorRadio
    );

    window.gameSettings[selectEl.dataset.settingsKey] = selectEl.value;

    radioEls.forEach((radioEl) => {
      if (radioEl.value === selectEl.value) {
        radioEl.checked = true;
        return;
      }
      radioEl.checked = false;
    });
  };

  const bindSettingsControlGroup = ({
    radio: selectorRadio,
    select: selectorSelect,
    settingsKey,
  }) => {
    const radioElements =
      settingsElements.modalEl.querySelectorAll(selectorRadio);
    const selectElement =
      settingsElements.modalEl.querySelector(selectorSelect);

    if (!(radioElements && selectElement)) {
      console.error(
        'Settings element not found:',
        selectorRadio,
        selectorSelect
      );
    }

    radioElements.forEach((el) => {
      el.dataset.selectorSelect = selectorSelect;
      el.dataset.settingsKey = settingsKey;
      el.addEventListener('change', onRadioChange);
    });

    selectElement.dataset.selectorRadio = selectorRadio;
    selectElement.dataset.settingsKey = settingsKey;
    selectElement.addEventListener('change', onSelectChange);
  };

  const bindControls = () => {
    settingsElements.btnEl.addEventListener('click', showSettingsModal);
    settingsElements.cancelBtnEl.addEventListener('click', closeSettingsModal);

    CONTROLS.forEach(bindSettingsControlGroup);
  };

  bindControls();

  window.gameSettings = {
    cardsQty: 16,
    closeSettingsModal,
    showCards: 'false',
    showSettingsModal,
    speed: 600,
  };
})();
