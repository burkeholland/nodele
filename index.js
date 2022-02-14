const prompts = require("prompts");
const chalk = require("chalk");
const i18n = require("./i18n/index.js")

const TERMINAL_COLS = process.stdout.columns;
const MAX_TRIES = 6;

// initialize words and texts
const { TEXTS, WORDS } = i18n.load(process.argv[ 2 ] || "en");

// global results for showing all results at once
let previousGuesses = [];
let globalResults = "";
let puzzle = "";

const PROMPTS = {
  askForWord: {
    type: "text",
    name: "word",
    format: (value) => {
      return value.toUpperCase();
    },
    message: () => `${TEXTS.ENTER_A_5_LETTER_WORD_PROMPT} [${previousGuesses.length+1}/${MAX_TRIES}]`,
    validate: (value) => {
      if (value.length != 5) {
        return TEXTS.WORD_MUST_BE_5_LETTERS;
      } else if (!/^[a-z]+$/i.test(value)) {
        return TEXTS.WORD_MUST_ONLY_CONTAIN_LETTERS;
      } else if (!WORDS.includes(value.toUpperCase())) {
        // WORDS is now in uppercase, so can directly check via includes
        return TEXTS.WORD_NOT_FOUND_IN_WORD_LIST;
      } else if (previousGuesses.includes(value.toUpperCase())) {
        // same word already entered
        return TEXTS.WORD_ALREADY_ENTERED;
      }
      return true;
    }
  },
  askForNewGame: {
    type: "select",
    name: "value",
    message: TEXTS.NEXT_WORD_PROMPT,
    choices: [
      { title: TEXTS.YES, value: true },
      { title: TEXTS.NO, value: false }
    ]
  }
};

async function check(guess) {
  // clear previous results
  console.clear();
  let puzzleNotMatchedLetters = puzzle;
  const colors = Array(guess.length).fill(chalk.white.bgGrey);
  // loop through guess and mark green if fully correct
  for (let i = 0; i < guess.length; i++) {
    // check if the letter at the specified index in the guess word exactly
    // matches the letter at the specified index in the puzzle
    if (guess[i] === puzzleNotMatchedLetters[i]) {
      colors[i] = chalk.white.bgGreen;
      // remove letter from answer, so it's not scored again
      puzzleNotMatchedLetters = puzzleNotMatchedLetters.replace(guess[i], " ");
    }
  }
  // loop through guess and mark yellow if partially correct
  for (let i = 0; i < guess.length; i++) {
    // check if the letter at the specified index in the guess word is at least
    // contained in the puzzle at some other position
    if (guess[i] !== puzzleNotMatchedLetters[i] && puzzleNotMatchedLetters.includes(guess[i])) {
      colors[i] = chalk.white.bgYellow;
      // remove letter from answer, so it's not scored again
      puzzleNotMatchedLetters = puzzleNotMatchedLetters.replace(guess[i], " ");
    }
  }
  let results = "";
  // loop over each letter and use its color to add it to the output
  for (let i = 0; i < guess.length; i++) {
    results += colors[i].bold(` ${guess[i]} `);
  }
  globalResults += results.padEnd(results.length + TERMINAL_COLS - 15, " ");
  // 15 in above code is 5 letters and 2 spaces in start and end of characters, 3 char for a letter, total 3 *5 =15
  // it has to be hardcoded as the chalk's result changes the number of characters
  process.stdout.write(globalResults);
}

async function play(tries) {
  // the user gets 5 tries to solve the puzzle not including the first guess
  if (tries < MAX_TRIES) {
    // ask the player for a guess word (spread operator is used to create a new object and force prompt not to be cached)
    const {word: guess} = await prompts({...PROMPTS.askForWord});
    if (typeof guess === "undefined") {
      // this scenario happens when a user presses Ctrl+C and terminates program
      // previously it was throwing an error
      console.clear();
      console.log(TEXTS.GAME_CLOSED_GOODBYE);
      process.exit(0); // 0 for exitting without throwing error
    }
    // add to already enterd words list
    previousGuesses.push(guess);
    // if the word matches, they win!
    if (guess == puzzle) {
      // show board again
      check(guess);
      process.stdout.write("\n");
      console.log(chalk.white.green.bold(TEXTS.WINNER));
    } else {
      check(guess);
      // this forces std out to print out the results for the last guess
      process.stdout.write("\n");
      // repeat the game and increment the number of tries
      await play(++tries);
    }
  } else {
    console.log(i18n.stringTemplateParser(TEXTS.INCORRECT_THE_WORD_WAS_puzzle, {puzzle: chalk.white.bgRed.bold(puzzle)}));
  }
}

function initializeNewGame() {
  console.clear();

  // reset global variables
  previousGuesses = [];
  globalResults = "";
  puzzle = "";

  // get a random word
  const randomNumber = Math.floor(Math.random(WORDS.length) * WORDS.length);
  puzzle = WORDS[randomNumber].toUpperCase();
}

async function hasToStartANewGame(){
  process.stdout.write("\n");
  const { value } = await prompts(PROMPTS.askForNewGame);
  process.stdout.write("\n");
  return value;
}

async function main() {
  let startNewGame = true;

  while(startNewGame) {
    initializeNewGame();
    // start the game
    await play(0);
    startNewGame = await hasToStartANewGame();
  }
  console.log(TEXTS.GOODBYE);
}

main();
