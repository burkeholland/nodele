const prompts = require("prompts");
const chalk = require("chalk");
const wordsJSON = require("./words.json");

const TERMINAL_COLS = process.stdout.columns;
const MAX_TRIES = 6;
const previousGuesses = [];

// global results for showing all results at once
let globalResults = "";
let puzzle = "";

const wordlePrompt = {
  type: "text",
  name: "word",
  format: (value) => {
    return value.toUpperCase();
  },
  message: "Enter a 5 letter word...",
  validate: (value) => {
    if (value.length != 5) {
      return "Word must be 5 letters";
    } else if (!/^[a-z]+$/i.test(value)) {
      return "Word must only contain letters";
    } else if (!wordsJSON.includes(value.toUpperCase())) {
      // wordsJSON is now in uppercase, so can directly check via includes
      return "Word not found in word list";
    } else if (previousGuesses.includes(value.toUpperCase())) {
      // same word already entered
      return "You have already entered this word";
    }
    return true;
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
    // ask the player for a guess word
    const response = await prompts(wordlePrompt);
    const guess = response.word;
    if (typeof guess === "undefined") {
      // this scenario happens when a user presses Ctrl+C and terminates program
      // previously it was throwing an error
      console.clear();
      console.log("You closed the game, Good bye!");
      process.exit(0); // 0 for exitting without throwing error
    }
    // add to already enterd words list
    previousGuesses.push(guess);
    // if the word matches, they win!
    if (guess == puzzle) {
      // show board again
      check(guess);
      console.log("WINNER!");
    } else {
      check(guess);
      // this forces std out to print out the results for the last guess
      process.stdout.write("\n");
      // repeat the game and increment the number of tries
      play(++tries);
    }
  } else {
    console.log(`INCORRECT: The word was ${puzzle}`);
  }
}

async function main() {
  // get a random word
  const randomNumber = Math.floor(Math.random(wordsJSON.length) * wordsJSON.length);
  puzzle = wordsJSON[randomNumber].toUpperCase();
  // start the game
  await play(0);
}

main();
