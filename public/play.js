// Controls all game interactions and stores resulting score in browser's local storage.

const btnDescriptions = [
  { file: "sound1.mp3", hue: 120 },
  { file: "sound2.mp3", hue: 0 },
  { file: "sound3.mp3", hue: 60 },
  { file: "sound4.mp3", hue: 240 },
];

class Button {
  constructor(description, el) {
    this.el = el;
    this.hue = description.hue;
    this.sound = loadSound(description.file);
    this.paint(25);
  }

  paint(level) {
    const background = `hsl(${this.hue}, 100%, ${level}%)`;
    this.el.style.backgroundColor = background;
  }

  async press(volume) {
    this.paint(50);
    await this.play(volume);
    this.paint(25);
  }

  async play(volume = 1.0) {
    this.sound.volume = volume;
    await new Promise((resolve) => {
      this.sound.onended = resolve;
      this.sound.play();
    });
  }
}

class Game {
  buttons;
  allowPlayer;
  sequence;
  playerPlaybackPos;
  mistakeSound;

  constructor() {
    this.buttons = new Map();
    this.allowPlayer = false;
    this.sequence = [];
    this.playerPlaybackPos = 0;
    this.mistakeSound = loadSound("error.mp3");

    document.querySelectorAll(".game-button").forEach((el, i) => {
      if (i < btnDescriptions.length) {
        this.buttons.set(el.id, new Button(btnDescriptions[i], el));
      }
    });

    const playerNameEl = document.querySelector(".player-name");
    playerNameEl.textContent = this.getPlayerName();
  }

  async pressButton(button) {
    if (this.allowPlayer) {
      this.allowPlayer = false;
      await this.buttons.get(button.id).press(1.0);

      // See if the user selects the correct button.
      if (this.sequence[this.playerPlaybackPos].el.id === button.id) {
        this.playerPlaybackPos++;
        if (this.playerPlaybackPos === this.sequence.length) {
          this.playerPlaybackPos = 0;
          this.addButton();
          this.updateScore(this.sequence.length - 1);
          await this.playSequence();
        }
        this.allowPlayer = true;
      } else {
        // If they didn't, save their score, play the mistake sound, and have the buttons do their little dance.
        this.saveScore(this.sequence.length - 1);
        this.mistakeSound.play();
        await this.buttonDance(2);
      }
    }
  }

  // Resets all of the data for a new game, plays button dance, adds the first button in the sequence and shows it to the user.
  async reset() {
    this.allowPlayer = false;
    this.playerPlaybackPos = 0;
    this.sequence = [];
    this.updateScore("--");
    await this.buttonDance(1);
    this.addButton();
    await this.playSequence();
    this.allowPlayer = true;
  }

  // Gets the player name from local storage.
  getPlayerName() {
    return localStorage.getItem("userName") ?? "Mystery Player";
  }

  // Shows the player the sequence of buttons they need to press.
  async playSequence() {
    await delay(500);
    for (const btn of this.sequence) {
      await btn.press(1.0);
      await delay(100);
    }
  }

  // Adds a random button to the sequence the player needs to copy.
  addButton() {
    const btn = this.getRandomButton();
    this.sequence.push(btn);
  }

  // Modifies the score displayed on the page.
  updateScore(score) {
    const scoreEl = document.querySelector("#score");
    scoreEl.textContent = score;
  }

  // Goes through the buttons and lights them up. Loops laps times.
  async buttonDance(laps = 1) {
    for (let step = 0; step < laps; step++) {
      for (const btn of this.buttons.values()) {
        await btn.press(0.0);
      }
    }
  }

  // Randomly chooses a button from the list of buttons.
  getRandomButton() {
    let buttons = Array.from(this.buttons.values());
    return buttons[Math.floor(Math.random() * this.buttons.size)];
  }

  // Save the final score of the game to the scores list.
  async saveScore(score) {
    const userName = this.getPlayerName();
    const date = new Date().toLocaleDateString();
    const newScore = { name: userName, score: score, date: date };

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newScore),
      });

      const scores = await response.json();
      localStorage.setItem("scores", JSON.stringify(scores));
    } catch {
      this.updateScoresLocal(newScore);
    }
  }

  updateScoresLocal(newScore) {
    let scores = [];
    const scoresText = localStorage.getItem("scores");
    // If there are already scores saved, parse them.
    if (scoresText) {
      scores = JSON.parse(scoresText);
    }

    let found = false;
    for (const [i, prevScore] of scores.entries()) {
      if (newScore > prevScore.score) {
        scores.splice(i, 0, newScore);
        found = true;
        break;
      }
    }

    if (!found) {
      scores.push(newScore);
    }

    if (scores.length > 10) {
      scores.length = 10;
    }

    // After adding the new score to the list, save the updated list in local storage.
    localStorage.setItem("scores", JSON.stringify(scores));
  }
}

const game = new Game();

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, milliseconds);
  });
}

function loadSound(filename) {
  return new Audio("assets/" + filename);
}
