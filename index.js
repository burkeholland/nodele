const prompts = require("prompts");
const chalk = require("chalk");
const wordsJSON = require("./words.json");

let puzzle = "";

const wordlePrompt = {
  type: "text",
  name: "word",
  message: "Enter a 5 word...",
  validate: value => value.length != 5 ? 'Word must be 5 letters' : true
};

async function check(guess) {
  let results = [];
  // loop over each letter in the word
  for (let i in guess) {
    let attempt = { letter: guess[i], color: "bgGrey" };
    // check if the letter at the specified index in the guess word exactly
    // matches the letter at the specified index in the puzzle
    if (attempt.letter === puzzle[i]) {
      process.stdout.write(chalk.white.bgGreen.bold(` ${guess[i]} \t`));
      continue;
    }
    // check if the letter at the specified index in the guess word is at least
    // contained in the puzzle at some other position
    if (puzzle.includes(attempt.letter)) {
      process.stdout.write(chalk.white.bgYellow.bold(` ${guess[i]} \t`));
      continue;
    }
    // otherwise the letter doesn't exist at all in the puzzle
    process.stdout.write(chalk.white.bgGrey.bold(` ${guess[i]} \t`));
  }
  return results;
}

async function play(tries) {
  // the user gets 5 tries to solve the puzzle not including the first guess
  if (tries < 6) {
    // ask the player for a guess word
    const response = await prompts(wordlePrompt);
    const guess = response.word.toUpperCase();
    // if the word matches, they win!
    if (guess == puzzle) {
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
  randomNumber = Math.floor(Math.random(wordsJSON.length) * wordsJSON.length);
  puzzle = wordsJSON[randomNumber].toUpperCase();

  // start the game
  await play(0);
}

main();
