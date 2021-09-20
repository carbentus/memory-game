// BUG przy szybkim klikaniu poprzednie karty nie odwracają sie. założyć opóźnienie?
const AVAILABLE_PICTURES = 24;
const CLASS_IS_SHOWN = 'is-shown';
const PATH_PICTURE_BLANK = 'images/blank.svg';
const SELECTOR_CARDS_CONTAINER = '.cards-container';
const SELECTOR_CONGRATS = '.congrats-container';
const SELECTOR_MOVES = '#moves';
const SELECTOR_PLAY_BTN = '.settings-confirm-btn';
const SELECTOR_RESTART_BTN = '.js-restart-game';
const SELECTOR_TIMER = '.js-timer';

const { gameSettings: settings } = window;

const INITIAL_STATE = {
  cardsArray: [],
  moveCounter: 1,
  startTimestamp: 0,
  timerInterval: 0,
};

const gameElements = {
  cardsContainerEl: document.querySelector(SELECTOR_CARDS_CONTAINER),
  congratsEl: document.querySelector(SELECTOR_CONGRATS),
  movesDisplayEl: document.querySelector(SELECTOR_MOVES),
  playBtnEl: document.querySelector(SELECTOR_PLAY_BTN),
  timerEl: document.querySelector(SELECTOR_TIMER),
};

let state = {
  ...INITIAL_STATE,
};

const availablePictures = 24;
let randomPictures = [];
let cardsArray = [];
let cardsChosen = [];
let cardsChosenId = [];

let gameStatus = '';
let moveCounter = 0;
let currentCardsQty = 0;
let sec = 1;
let min = 0;
let idInterval;

// Functions
// select of random pictures from all available
const getRandomPictures = () => {
  const randomPictures = [];
  while (randomPictures.length < settings.cardsQty / 2) {
    var randomNumber = Math.floor(Math.random() * AVAILABLE_PICTURES) + 1;
    if (randomPictures.indexOf(randomNumber) === -1)
      randomPictures.push(randomNumber);
  }
  return [...randomPictures, ...randomPictures].sort(() => 0.5 - Math.random());
};

const renderTimer = (m, s) => {
  gameElements.timerEl.innerHTML = `
    <span class="time_title">Time: </span>
    <span id="m">${m}</span><span class="chrono_sep">:</span><span id="s">${s}</span>
  `;
};

// Time of the game
const countTime = () => {
  state.startTimestamp = Date.now() / 1000;
  state.timerInterval = setInterval(function () {
    const now = Date.now() / 1000;
    const deltaSeconds = now - state.startTimestamp;
    renderTimer(Math.floor(deltaSeconds / 60), Math.floor(deltaSeconds % 60));
  }, 1000);
};

const incrementMoves = () => {
  gameElements.movesDisplayEl.innerHTML = state.moveCounter++;
};

const showCongrats = () => {
  gameElements.congratsEl.classList.add(CLASS_IS_SHOWN);
};

const hideCongrats = () => {
  gameElements.congratsEl.classList.remove(CLASS_IS_SHOWN);
};

const flipAllCards = () => {
  state.cardsArray.forEach(({ cardEl }) => flipCard(cardEl));
};

const handleCardFlipped = () => {
  const selectedCards = state.cardsArray.filter(({ isSelected }) => isSelected);

  // less than two cards selected, do nothing
  if (selectedCards.length < 2) {
    return;
  }

  // increment number of pairs shown
  incrementMoves();

  // match detected - remove cards
  if (selectedCards[0].pictureNumber === selectedCards[1].pictureNumber) {
    state.cardsArray = state.cardsArray.filter(({ isSelected }) => !isSelected);
    setTimeout(() => {
      selectedCards.forEach(({ cardEl }) => {
        cardEl.disabled = true;
      });
    }, settings.speed);
    return;
  }

  // no match - flip cards back to blank
  selectedCards.forEach((card) => {
    card.isSelected = false;
  });
  setTimeout(() => {
    selectedCards.forEach(({ cardEl }) => flipCard(cardEl));
  }, settings.speed);
};

const flipCard = (el) => {
  el.classList.toggle(CLASS_IS_SHOWN);
};

const handleAction = (e) => {
  const clickedCard = state.cardsArray.find(
    ({ cardEl }) => cardEl === e.currentTarget
  );
  clickedCard.isSelected = !clickedCard.isSelected;

  flipCard(clickedCard.cardEl);
  handleCardFlipped();

  // no cards left, game finished
  if (!state.cardsArray.length) {
    showCongrats();
    resetAll();
  }
};
// Time of the game
// const countTime = () => {
//   if (gameStatus === 'active') {
//     clearInterval(idInterval);
//     idInterval = setInterval(function () {
//       if (sec < 60) {
//         if (sec < 10) {
//           sec = `0${sec}`;
//         }
//         seconds.innerHTML = sec;
//         sec++;
//       } else if (sec === 60) {
//         min++;
//         seconds.innerHTML = '00';
//         if (min < 10) {
//           min = `0${min}`;
//         }
//         minutes.innerHTML = min;
//         sec = 1;
//       }
//     }, 1000);
//   }
//   if (gameStatus === 'finished' || gameStatus === '') {
//     clearInterval(idInterval);
//   }
//   console.log(state.cardsArray);
// };

const resetAll = () => {
  clearInterval(state.timerInterval);
  renderTimer('--', '--');

  gameElements.cardsContainerEl.innerHTML = '';
  gameElements.movesDisplayEl.innerHTML = '--';

  state = {
    ...INITIAL_STATE,
  };
};

const renderCardEl = (pictureNumber) => {
  const cardBtnEl = document.createElement('button');
  cardBtnEl.classList.add('card-container');
  cardBtnEl.innerHTML = `
    <img class="card card--blank" src="${PATH_PICTURE_BLANK}">
    <img class="card card--image" src="images/${pictureNumber}.svg">
  `;
  gameElements.cardsContainerEl.appendChild(cardBtnEl);

  return cardBtnEl;
};

const renderBoard = () => {
  gameElements.cardsContainerEl.setAttribute(
    'data-cards-qty',
    `x${settings.cardsQty}`
  );
  state.cardsArray = getRandomPictures().map((pictureNumber) => ({
    cardEl: renderCardEl(pictureNumber),
    pictureNumber,
    isSelected: false,
  }));
};

const bindBoard = () => {
  state.cardsArray.forEach(({ cardEl }) => {
    cardEl.addEventListener('click', handleAction);
  });
};

const startNewGame = () => {
  resetAll();
  hideCongrats();

  renderBoard();
  bindBoard();
  countTime();

  // Check settings: SHOW cards?
  if (settings.showCards === 'true') {
    let displayTime = 8000;

    if (settings.cardsQty <= 32) {
      displayTime = 6000;
    }
    if (settings.cardsQty <= 16) {
      displayTime = 4000;
    }

    flipAllCards();
    setTimeout(flipAllCards, displayTime);
  }
};

const handlePlayBtn = () => {
  settings.closeSettingsModal();
  startNewGame();
};

const bind = () => {
  document
    .querySelectorAll(SELECTOR_RESTART_BTN)
    .forEach((el) => el.addEventListener('click', startNewGame));

  gameElements.playBtnEl.addEventListener('click', handlePlayBtn);
};

bind();
settings.showSettingsModal();
// showSettingsModal();

console.log(settings.showCards);
console.log(typeof settings.showCards);
