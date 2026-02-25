const letters = ['I', 'G', 'H', 'N', 'S', 'T', 'W'];

const levels = [
  {
    words: {
      3: ['WIG', 'HIT', 'SIT'],
      4: ['TWIG', 'THIN', 'WING'],
      5: ['NIGHT', 'THING', 'STING']
    }
  },
  {
    words: {
      3: ['TIN', 'WIN', 'SIN'],
      4: ['HINT', 'WINS', 'SIGN'],
      5: ['SWING', 'WHIST', 'SIGHT']
    }
  }
];

let currentLevel = 0;
let typed = [];
let usedBtns = [];
let foundWords = new Set();
let pastLevelWords = new Set(); 

document.addEventListener('DOMContentLoaded', function () {
  const board = document.getElementById('word-board');
  const inputBox = document.getElementById('input-display');
  const msg = document.getElementById('msg-bar');
  const grid = document.getElementById('letter-grid');
  const enterBtn = document.getElementById('enter-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const nextLvlBtn = document.getElementById('next-lvl-btn');

  startLevel();

  function startLevel() {
    foundWords.forEach(word => pastLevelWords.add(word));
    foundWords.clear();
    typed = [];
    usedBtns = [];
    
    if (nextLvlBtn) nextLvlBtn.style.display = 'none';

    // Shuffle ang ltrs each lvl
    const shuffled = shuffleArray([...letters]);
    renderLetterGrid(shuffled);

    buildBoard();
    renderInput();
    showMsg("LEVEL " + (currentLevel + 1), "#2e8bff");
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function renderLetterGrid(shuffledLetters) {
    grid.innerHTML = ''; 
    shuffledLetters.forEach((char, index) => {
      const btn = document.createElement('button');
      btn.className = 'letter-btn';
      btn.textContent = char;
      btn.dataset.idx = index; 
      btn.addEventListener('click', () => pressLetter(char, index, btn));
      grid.appendChild(btn);
    });
  }

  function buildBoard() {
    board.innerHTML = '';
    const targetWords = levels[currentLevel].words;
    [3, 4, 5].forEach(len => {
      const group = document.createElement('div');
      group.className = 'word-group';
      const label = document.createElement('div');
      label.className = 'group-label';
      label.textContent = len + " LETTER WORDS";
      group.appendChild(label);
      const row = document.createElement('div');
      row.className = 'word-slots-row';
      targetWords[len].forEach(word => {
        const slot = document.createElement('div');
        slot.className = 'word-slot';
        slot.dataset.word = word;
        for (let i = 0; i < len; i++) {
          const cell = document.createElement('div');
          cell.className = 'board-cell';
          slot.appendChild(cell);
        }
        row.appendChild(slot);
      });
      group.appendChild(row);
      board.appendChild(group);
    });
  }

  function pressLetter(letter, idx, btn) {
    if (typed.length >= 7 || btn.classList.contains('used')) return;
    typed.push(letter);
    usedBtns.push(idx);
    btn.classList.add('used');
    renderInput();
  }

  enterBtn.addEventListener('click', () => {
    const word = typed.join('').toUpperCase();
    const targetWords = levels[currentLevel].words;
    const allTargets = Object.values(targetWords).flat();

    if (pastLevelWords.has(word)) {
      showMsg("Already found in Level 1!", "#a06020");
      clearTyped();
      return;
    }

    if (foundWords.has(word)) {
      showMsg("Already found!", "#a06020");
      clearTyped();
      return;
    }

    if (!allTargets.includes(word)) {
      showMsg("Wrong word!", "#c45070");
      inputBox.classList.add('shake');
      setTimeout(() => inputBox.classList.remove('shake'), 400);
      clearTyped();
      return;
    }

    foundWords.add(word);
    revealWord(word);
    showMsg("CORRECT! ✨", "#4caf50"); 
    clearTyped();

    if (allTargets.every(w => foundWords.has(w))) {
      setTimeout(() => {
        if (currentLevel < levels.length - 1) {
          showMsg("LEVEL COMPLETE! 🎉", "#4caf50");
          if (nextLvlBtn) nextLvlBtn.style.display = 'block';
        } else {
          document.getElementById('victory-overlay').classList.add('show');
        }
      }, 800);
    }
  });

  deleteBtn.addEventListener('click', () => {
    if (!typed.length) return;
    typed.pop();
    const lastIdx = usedBtns.pop();
    const btn = grid.querySelector(`[data-idx="${lastIdx}"]`);
    if (btn) btn.classList.remove('used');
    renderInput();
  });

  nextLvlBtn.addEventListener('click', () => {
    currentLevel++;
    startLevel();
  });

  function renderInput() {
    const tiles = inputBox.querySelectorAll('.input-tile');
    tiles.forEach((tile, i) => tile.textContent = typed[i] || '');
  }

  function revealWord(word) {
    const slot = board.querySelector(`[data-word="${word}"]`);
    if (slot) {
      [...slot.children].forEach((cell, i) => {
        cell.textContent = word[i];
        cell.classList.add('revealed');
      });
    }
  }

  function clearTyped() {
    typed = [];
    usedBtns = [];
    grid.querySelectorAll('.letter-btn').forEach(btn => btn.classList.remove('used'));
    renderInput();
  }

  function showMsg(text, color) {
    msg.textContent = text;
    msg.style.color = color;
  }
});