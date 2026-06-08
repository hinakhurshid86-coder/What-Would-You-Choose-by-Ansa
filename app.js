const DATA_PATH = './questions.json';

const state = {
  category: null,
  players: [],
  questionsByCategory: {
    kids: [],
    teens: [],
    adults: [],
    family: []
  },
  allQuestions: [],
  questionDeck: [],
  questionQueue: [],
  currentQuestion: null,
  currentRound: 0,
  totalRounds: 12,
  playerQueue: [],
  selectedAnswer: null,
  siteRating: Number(localStorage.getItem('wrSiteRating')) || 4.9,
  toastTimeout: null
};

const elements = {
  landingSection: document.querySelector('#landing'),
  setupSection: document.querySelector('#setup'),
  gameSection: document.querySelector('#game'),
  homeButton: document.querySelector('#home-btn'),
  backToHome: document.querySelector('#back-to-home'),
  setupCategoryLabel: document.querySelector('#setup-category-label'),
  gameCategoryLabel: document.querySelector('#game-category'),
  currentPlayerLabel: document.querySelector('#current-player'),
  progressIndicator: document.querySelector('#progress-indicator'),
  playerCount: document.querySelector('#player-count'),
  playerFields: document.querySelector('#player-fields'),
  startGameButton: document.querySelector('#start-game'),
  changeCategoryButton: document.querySelector('#change-category'),
  restartGameButton: document.querySelector('#restart-game'),
  randomQuestionButton: document.querySelector('#random-question'),
  nextQuestionButton: document.querySelector('#next-question'),
  questionText: document.querySelector('#question-text'),
  answersGrid: document.querySelector('#answers-grid'),
  toast: document.querySelector('.toast'),
  categoryCards: document.querySelectorAll('.category-card'),
  menuToggle: document.querySelector('#menu-toggle'),
  navMenu: document.querySelector('#nav-menu'),
  ratingStars: null,
  ratingText: document.querySelector('#rating-text'),
  difficultyBadge: document.querySelector('#difficultyBadge'),
  resultPanel: document.querySelector('#resultPanel'),
  optionOneLabel: document.querySelector('#optionOneLabel'),
  optionTwoLabel: document.querySelector('#optionTwoLabel'),
  optionOnePercent: document.querySelector('#optionOnePercent'),
  optionTwoPercent: document.querySelector('#optionTwoPercent'),
  optionOneFill: document.querySelector('#optionOneFill'),
  optionTwoFill: document.querySelector('#optionTwoFill'),
  hardestQuestions: document.querySelector('#hardestQuestions')
};

const categories = {
  kids: {
    title: 'Kids',
    description: 'Easy and playful dilemmas perfect for young imaginations.',
    accent: 'var(--accent-blue)'
  },
  teens: {
    title: 'Teens',
    description: 'Creative, social, and emotionally fun choices for teens.',
    accent: 'var(--accent-purple)'
  },
  adults: {
    title: 'Adults',
    description: 'Thought-provoking and hilarious dilemmas for adults.',
    accent: 'var(--accent-cyan)'
  },
  family: {
    title: 'Family',
    description: 'Friendly scenarios to get the whole family talking.',
    accent: 'var(--accent-blue)'
  }
};

const questionParts = {
  kids: {
    core: [
      { left: 'have a pet dragon', right: 'have a pet unicorn' },
      { left: 'fly around the playground', right: 'become invisible at snack time' },
      { left: 'eat rainbow ice cream forever', right: 'drink chocolate milk from a candy cup' },
      { left: 'visit a candy castle', right: 'play in a bubble cloud' },
      { left: 'talk to animals', right: 'read minds of toys' },
      { left: 'ride a giant turtle', right: 'sail a glowing boat' },
      { left: 'have shoes that sparkle', right: 'wear a cape that floats' },
      { left: 'jump on clouds', right: 'slide down rainbows' },
      { left: 'build a fort that never falls', right: 'create a secret tree house' },
      { left: 'have silly giggle bubbles', right: 'make music with your footsteps' }
    ],
    left: ['be a superhero for a day', 'discover a hidden door', 'ride a friendly dinosaur', 'find a magical map', 'grow candy flowers', 'have a talking backpack', 'explore a glowing cave', 'wear a hat that changes color', 'ride a flying scooter', 'have super-soft wings', 'have a sparkling kite', 'jump on trampoline stars', 'paint with moonlight', 'create a bubble rainbow', 'play with glowing kittens', 'have a pillow that sings', 'meet a friendly robot', 'make your shadow dance', 'slide on shooting stars', 'find a treasure chest'],
    right: ['be a wizard in training', 'have a giant teddy bear friend', 'visit a moon playground', 'discover a friendly monster', 'build a castle from marshmallows', 'invent a playful machine', 'have a rainbow umbrella', 'swim in a sea of jelly', 'play with dancing balloons', 'wear shoes made of clouds', 'talk to the trees', 'make the flowers glow', 'explore a secret garden', 'ride a glowing snail', 'visit a pumpkin train', 'have a magical paintbrush', 'have crayons that draw themselves', 'hear the stars smile', 'create a toy orchestra', 'find a glowing key']
  },
  teens: {
    core: [
      { left: 'travel the world', right: 'become famous' },
      { left: 'have unlimited music', right: 'have unlimited movies' },
      { left: 'attend a dream concert', right: 'visit a dream city' },
      { left: 'spend a day with your favorite character', right: 'spend a day with your favorite artist' },
      { left: 'have a perfect selfie camera', right: 'have a perfect playlist for every mood' },
      { left: 'learn a new language instantly', right: 'learn a new instrument instantly' },
      { left: 'host the ultimate game night', right: 'plan the perfect movie marathon' },
      { left: 'discover a secret skill', right: 'find a hidden talent' },
      { left: 'create a viral idea', right: 'design an amazing app' },
      { left: 'have endless summer days', right: 'have endless cozy evenings' }
    ],
    left: ['meet someone inspiring', 'write your own story', 'design a futuristic room', 'create an amazing playlist', 'captain a road trip', 'build a dream project', 'explore a new hobby', 'plan a surprise party', 'learn how to cook a favorite dish', 'win a creative challenge', 'capture a perfect photo', 'start a friendly club', 'plan a weekend adventure', 'discover a hidden spot', 'create an art piece', 'make a funny video', 'solve a mystery with friends', 'map a secret trail', 'share your favorite story', 'start a cool trend', 'try a bold new style'],
    right: ['lead a team of friends', 'craft a personalized journal', 'explore a city at night', 'perform on a stage', 'host a themed party', 'debate your favorite idea', 'share a big secret', 'learn an exciting skill', 'collect unforgettable memories', 'design your own fashion', 'launch a friendship challenge', 'discover a new playlist', 'build a creative space', 'plan a surprise trip', 'paint a mural', 'save a day with kindness', 'compose a special song', 'capture a magical moment', 'create a unique dessert', 'solve a fun puzzle', 'try an unusual hobby']
  },
  adults: {
    core: [
      { left: 'retire early', right: 'travel every year' },
      { left: 'live in the mountains', right: 'live near the ocean' },
      { left: 'have more free time', right: 'have more creative projects' },
      { left: 'learn something new every month', right: 'discover a new favorite place every year' },
      { left: 'have a calm weekend routine', right: 'have a spontaneous adventure plan' },
      { left: 'cook your favorite meal for friends', right: 'plan an unforgettable outing together' },
      { left: 'work in a cozy space', right: 'work while traveling' },
      { left: 'read a great book slowly', right: 'watch an inspiring film collection' },
      { left: 'host a relaxing evening', right: 'host an exciting celebration' },
      { left: 'have a garden retreat', right: 'have a creative studio' }
    ],
    left: ['teach a skill you love', 'discover a scenic route', 'design a dream room', 'spend a quiet morning', 'capture a meaningful memory', 'taste a new cuisine', 'meet someone wise', 'write a thoughtful note', 'start a mindful habit', 'explore a cultural event', 'begin a small project', 'restore a cherished item', 'plan a meaningful day', 'listen to an inspiring story', 'decorate a cozy corner', 'go on a peaceful walk', 'learn a timeless craft', 'create a thoughtful gift', 'organize a simple celebration', 'take a creative detour', 'find a perfect balance'],
    right: ['discover a calming ritual', 'share a surprising idea', 'build a joyful memory', 'try a relaxing hobby', 'plan a scenic getaway', 'listen to a favorite album', 'host a meaningful conversation', 'treat yourself to a new experience', 'build a thoughtful collection', 'capture the beauty of a place', 'design a new routine', 'learn from someone interesting', 'share a nostalgic story', 'create a peaceful space', 'write a short letter', 'explore an artistic hobby', 'build a memorable tradition', 'gather with people you care about', 'practice something patient', 'plan a future dream', 'choose an inspiring path']
  },
  family: {
    core: [
      { left: 'have game night every day', right: 'have movie night every day' },
      { left: 'visit space', right: 'explore the deep ocean' },
      { left: 'build the tallest fort', right: 'create the best treasure hunt' },
      { left: 'learn a new family recipe', right: 'create a family storybook' },
      { left: 'travel to a nearby nature spot', right: 'stay in and play together all day' },
      { left: 'find a hidden park', right: 'discover a cozy reading place' },
      { left: 'make breakfast together', right: 'make dessert together' },
      { left: 'invent a family handshake', right: 'write a family cheer' },
      { left: 'take a silly photo', right: 'share a favorite memory' },
      { left: 'build a backyard campsite', right: 'watch shooting stars from the couch' }
    ],
    left: ['pack a picnic', 'set up a family art project', 'have a music and dance hour', 'make a new tradition', 'explore a museum', 'create a scavenger hunt', 'plan a themed evening', 'decorate for an imaginary holiday', 'build a cardboard city', 'make homemade ice cream', 'paint matching T-shirts', 'find a new hobby together', 'read a bedtime story as a group', 'create a laugh jar', 'make a nature treasure map', 'design a shared playlist', 'cook a favorite meal together', 'play a friendly challenge', 'go on a bike ride', 'build a story together', 'share talents in a mini-show'],
    right: ['have a cozy movie marathon', 'set up a star-gazing night', 'make a family time capsule', 'host a dessert tasting', 'make handmade cards for each other', 'play a silly costume game', 'create a backyard obstacle course', 'start a family gratitude wall', 'build a giant puzzle together', 'watch favorite home videos', 'plan a surprise outing', 'read jokes aloud', 'make a family journal', 'decorate a shared space', 'build an indoor picnic', 'try international snacks', 'have a storytelling circle', 'take a nature walk', 'create a family talent show', 'do a craft challenge', 'share future dreams']
  }
};

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function openSection(sectionId) {
  [elements.landingSection, elements.setupSection, elements.gameSection].forEach((section) => {
    section.classList.toggle('hidden', section.id !== sectionId);
  });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  window.clearTimeout(state.toastTimeout);
  state.toastTimeout = window.setTimeout(() => {
    elements.toast.classList.remove('visible');
  }, 2600);
}

function updateRatingStars() {
  if (!elements.ratingStars) return;
  elements.ratingStars.forEach((star, index) => {
    star.classList.toggle('selected', index < state.siteRating);
    star.setAttribute('aria-label', `${index + 1} star`);
  });
  elements.ratingText.textContent = `${state.siteRating.toFixed(1)}/5`;
}

function setSiteRating(rating) {
  state.siteRating = rating;
  localStorage.setItem('wrSiteRating', String(rating));
  updateRatingStars();
  showToast(`Thanks for rating ${rating} stars!`);
}

function toggleNavigation() {
  const expanded = elements.menuToggle.getAttribute('aria-expanded') === 'true';
  elements.menuToggle.setAttribute('aria-expanded', String(!expanded));
  elements.navMenu.classList.toggle('show');
}

function initRatingStars() {
  const starContainer = document.querySelector('#rating-stars');
  if (!starContainer) return;
  starContainer.innerHTML = '';
  for (let i = 0; i < 5; i += 1) {
    const starButton = document.createElement('button');
    starButton.type = 'button';
    starButton.className = 'rating-star';
    starButton.innerHTML = '★';
    starButton.addEventListener('click', () => setSiteRating(i + 1));
    starButton.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setSiteRating(i + 1);
      }
    });
    starContainer.appendChild(starButton);
  }
  elements.ratingStars = starContainer.querySelectorAll('.rating-star');
  updateRatingStars();
}

function getVoteStorage() {
  return JSON.parse(localStorage.getItem('wrVoteStats') || '{}');
}

function saveVoteStorage(storage) {
  localStorage.setItem('wrVoteStats', JSON.stringify(storage));
}

function stableHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildBasePercent(question) {
  const hash = stableHash(`${question.id}-${question.left}-${question.right}`);
  const offset = (hash % 11) - 5;
  const scale = (12 - question.difficulty) / 12;
  const adjustment = Math.round(offset * scale * 0.75);
  const base = 50 + adjustment;
  const leftPercent = Math.max(42, Math.min(58, base));
  return { left: leftPercent, right: 100 - leftPercent };
}

function recordVote(questionId, selectedIndex) {
  const storage = getVoteStorage();
  storage[questionId] = storage[questionId] || { left: 0, right: 0 };
  if (selectedIndex === 0) storage[questionId].left += 1;
  else storage[questionId].right += 1;
  saveVoteStorage(storage);
}

function getVoteDistribution(questionId, difficulty) {
  const storage = getVoteStorage();
  const stored = storage[questionId] || { left: 0, right: 0 };
  const base = buildBasePercent({ id: questionId, difficulty });
  const leftCount = Math.max(base.left, 0) + stored.left;
  const rightCount = Math.max(base.right, 0) + stored.right;
  const total = leftCount + rightCount;
  return {
    left: Math.round((leftCount / total) * 100),
    right: Math.round((rightCount / total) * 100)
  };
}

function renderHardestQuestions() {
  if (!elements.hardestQuestions) return;
  const hardest = state.allQuestions.filter((item) => item.difficulty === 10).slice(0, 10);
  elements.hardestQuestions.innerHTML = hardest.map((question) => `
    <article class="hardest-card" data-id="${question.id}">
      <div class="hardest-card-meta">
        <span>10/10</span>
      </div>
      <h3>${question.text}</h3>
      <button type="button" class="hardest-action">Try this dilemma</button>
    </article>
  `).join('');
  elements.hardestQuestions.querySelectorAll('.hardest-card').forEach((card) => {
    card.addEventListener('click', () => {
      const questionId = card.dataset.id;
      loadHardestQuestion(questionId);
    });
  });
}

function loadHardestQuestion(questionId) {
  const question = state.allQuestions.find((item) => item.id === questionId);
  if (!question) return;
  state.questionQueue[state.currentRound] = question;
  renderCurrentQuestion();
  openSection('game');
}

function promptPlayerCount(value) {
  const count = Math.min(Math.max(Number(value), 1), 6);
  elements.playerFields.innerHTML = '';
  for (let index = 1; index <= count; index += 1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'player-field';
    wrapper.innerHTML = `
      <label>
        Player ${index}
        <input type="text" name="player-${index}" placeholder="Player ${index}" value="Player ${index}" />
      </label>
    `;
    elements.playerFields.appendChild(wrapper);
  }
}

function collectPlayers() {
  const inputs = elements.playerFields.querySelectorAll('input');
  const players = [];
  inputs.forEach((input, index) => {
    const name = input.value.trim() || `Player ${index + 1}`;
    players.push({ name });
  });
  return players;
}

async function loadQuestions() {
  const sources = [DATA_PATH, './more-questions.json'];
  try {
    const responses = await Promise.all(sources.map((source) => fetch(source).then((res) => {
      if (!res.ok) throw new Error(`${source} failed to load`);
      return res.json();
    }).catch((error) => {
      console.warn(error);
      return [];
    })));

    const questions = responses.flat();
    if (questions.length === 0) {
      throw new Error('No questions could be loaded');
    }

    state.allQuestions = questions;
    state.allQuestions.forEach((question) => {
      if (state.questionsByCategory[question.category]) {
        state.questionsByCategory[question.category].push(question);
      }
    });
    renderHardestQuestions();
  } catch (error) {
    console.error(error);
    showToast('Could not load questions. Run the app from a local server (for example, npm start or node server.js).');
  }
}

function prepareGame() {
  const deck = shuffle([...state.questionsByCategory[state.category]]);
  state.questionDeck = deck;
  state.questionQueue = deck.slice(0, state.totalRounds);
  state.playerQueue = shuffle(state.players.map((player) => player.name));
  state.currentRound = 0;
  state.selectedAnswer = null;
  openSection('game');
  renderGameHeader();
  renderCurrentQuestion();
}

function renderGameHeader() {
  const category = categories[state.category] || {};
  elements.gameCategoryLabel.textContent = category.title || '';
  elements.currentPlayerLabel.textContent = `Now it’s ${getNextPlayerName()}`;
  elements.progressIndicator.textContent = `Question ${Math.min(state.currentRound + 1, state.questionQueue.length)} of ${state.questionQueue.length}`;
}

function getNextPlayerName() {
  if (state.playerQueue.length === 0) {
    state.playerQueue = shuffle(state.players.map((player) => player.name));
  }
  return state.playerQueue[0];
}

function renderCurrentQuestion() {
  const question = state.questionQueue[state.currentRound];
  if (!question) {
    elements.questionText.textContent = 'You reached the end of this session. Restart or choose another category.';
    elements.answersGrid.innerHTML = '';
    if (elements.resultPanel) elements.resultPanel.classList.add('hidden');
    return;
  }
  state.currentQuestion = question;
  state.selectedAnswer = null;
  elements.questionText.textContent = question.text;
  if (elements.difficultyBadge) {
    elements.difficultyBadge.textContent = `Difficulty ${question.difficulty}/10`;
  }
  if (elements.optionOneLabel) elements.optionOneLabel.textContent = question.left;
  if (elements.optionTwoLabel) elements.optionTwoLabel.textContent = question.right;
  elements.answersGrid.innerHTML = question.choices.map((choice, index) => {
    return `<button type="button" class="answer-button" data-index="${index}">${choice}</button>`;
  }).join('');
  elements.answersGrid.querySelectorAll('.answer-button').forEach((button) => {
    button.addEventListener('click', () => handleAnswer(Number(button.dataset.index)));
  });
  if (elements.resultPanel) elements.resultPanel.classList.add('hidden');
  renderGameHeader();
}

function handleAnswer(choiceIndex) {
  if (!state.currentQuestion) return;
  state.selectedAnswer = choiceIndex;
  elements.answersGrid.querySelectorAll('.answer-button').forEach((button) => {
    const index = Number(button.dataset.index);
    button.classList.toggle('selected', index === choiceIndex);
  });
  recordVote(state.currentQuestion.id, choiceIndex);
  renderResultPanel();
  showToast('Your vote is locked in. See what everyone chose.');
}

function renderResultPanel() {
  if (!state.currentQuestion || !elements.resultPanel) return;
  const { left, right } = getVoteDistribution(state.currentQuestion.id, state.currentQuestion.difficulty);
  elements.optionOnePercent.textContent = `${left}%`;
  elements.optionTwoPercent.textContent = `${right}%`;
  elements.optionOneFill.style.width = `${left}%`;
  elements.optionTwoFill.style.width = `${right}%`;
  elements.resultPanel.classList.remove('hidden');
}

function moveToNextQuestion() {
  if (!state.currentQuestion) return;
  state.currentRound += 1;
  if (state.currentRound >= state.questionQueue.length) {
    elements.questionText.textContent = 'You have completed the current session. Restart the game or choose another category.';
    elements.answersGrid.innerHTML = '';
    if (elements.resultPanel) elements.resultPanel.classList.add('hidden');
    elements.progressIndicator.textContent = `Complete — ${state.questionQueue.length} questions`;
    return;
  }
  state.playerQueue.shift();
  renderGameHeader();
  renderCurrentQuestion();
}

function chooseRandomQuestion() {
  const remaining = state.questionDeck.filter((item) => !state.questionQueue.includes(item));
  if (remaining.length === 0) {
    showToast('No more random questions available in this category.');
    return;
  }
  const chosen = remaining[Math.floor(Math.random() * remaining.length)];
  state.questionQueue[state.currentRound] = chosen;
  renderCurrentQuestion();
  showToast('Random question selected.');
}

function restartGame() {
  state.questionQueue = shuffle(state.questionDeck).slice(0, state.totalRounds);
  state.currentRound = 0;
  state.playerQueue = shuffle(state.players.map((player) => player.name));
  renderGameHeader();
  renderCurrentQuestion();
  showToast('Session restarted successfully.');
}

function changeCategory() {
  openSection('landing');
}

function renderSetupScreen() {
  const category = categories[state.category];
  if (!category) return;
  elements.setupCategoryLabel.textContent = `${category.title} category selected`;
  elements.playerCount.value = 2;
  promptPlayerCount(2);
  openSection('setup');
}

function handleCategorySelection(categoryKey) {
  if (!state.questionsByCategory[categoryKey] || state.questionsByCategory[categoryKey].length === 0) {
    showToast('Questions are still loading. Please wait a moment.');
    return;
  }
  state.category = categoryKey;
  renderSetupScreen();
  if (elements.navMenu) {
    elements.navMenu.classList.remove('show');
    elements.menuToggle.setAttribute('aria-expanded', 'false');
  }
}

function init() {
  openSection('landing');
  loadQuestions();
  elements.categoryCards.forEach((button) => {
    button.addEventListener('click', () => handleCategorySelection(button.dataset.category));
  });
  for (let i = 1; i <= 6; i += 1) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = String(i);
    elements.playerCount.appendChild(option);
  }
  elements.playerCount.addEventListener('change', (event) => {
    promptPlayerCount(event.target.value);
  });
  elements.startGameButton.addEventListener('click', () => {
    state.players = collectPlayers();
    if (!state.players.length) {
      showToast('Add at least one player name to continue.');
      return;
    }
    prepareGame();
  });
  elements.backToHome.addEventListener('click', changeCategory);
  elements.homeButton.addEventListener('click', changeCategory);
  elements.changeCategoryButton.addEventListener('click', changeCategory);
  elements.restartGameButton.addEventListener('click', restartGame);
  elements.nextQuestionButton.addEventListener('click', moveToNextQuestion);
  elements.randomQuestionButton.addEventListener('click', chooseRandomQuestion);
  if (elements.menuToggle && elements.navMenu) {
    elements.menuToggle.addEventListener('click', toggleNavigation);
    elements.navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        elements.navMenu.classList.remove('show');
        elements.menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
  initRatingStars();
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && document.activeElement.tagName !== 'TEXTAREA') {
      const activeSection = document.querySelector('main > section:not(.hidden)');
      if (activeSection === elements.setupSection) {
        event.preventDefault();
        elements.startGameButton.click();
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
