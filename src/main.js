import { getGarble, checkIsGarble } from './words.js';
const MAX_ROWS = 10;
const MAX_TILES = 5;
var g_currentRow = 0;
var g_currentTile = 0;
var g_guess = "";
var g_secret = getGarble();
function setupHTMLElements() {
    setupGameTiles();
    setupKeyboardModule();
    return;
}
function setupEventListeners() {
    pageKeyboardEvents();
    return;
}
function checkGuessIsValid(guess) {
    if (guess.length != MAX_TILES) {
        console.log("Guess has incorrect length - BAD");
        return false;
    }
    if (!checkIsGarble(guess)) {
        console.log("Guess is NOT Garble - BAD");
        return false;
    }
    return true;
}
function winGame() {
    g_currentRow = MAX_ROWS + 1;
    console.log("GAME WON");
}
function loseGame() {
    g_currentRow = MAX_ROWS + 1;
    console.log("GAME LOST");
}
function compareGuessToSecret(guess) {
    if (!checkGuessIsValid(guess)) {
        return false;
    }
    for (let index in Array.from(guess)) {
        let tile = document.getElementById(`tile_r${g_currentRow}t${index}`);
        let keyboardKey = document.querySelector(".keyboardModule").querySelector(`#keyboardKey_${guess[index]}`);
        if (guess[index] == g_secret[index]) {
            tile.dataset.state = "correct" /* LetterState["CORRECT"] */;
            tile.style.background = "#538d4e" /* LetterColour["GREEN"] */;
            keyboardKey.style.backgroundColor = "#538d4e" /* LetterColour["GREEN"] */;
            continue;
        }
        if (g_secret.indexOf(guess[index]) != -1) {
            tile.dataset.state = "present" /* LetterState["PRESENT"] */;
            tile.style.background = "#b59f3b" /* LetterColour["YELLOW"] */;
            keyboardKey.style.backgroundColor = "#b59f3b" /* LetterColour["YELLOW"] */;
            continue;
        }
        keyboardKey.style.backgroundColor = "#3a3a3c" /* LetterColour["DARKGREY"] */;
        tile.style.background = "#3a3a3c" /* LetterColour["DARKGREY"] */;
        tile.dataset.state = "missing" /* LetterState["MISSING"] */;
    }
    if (guess == g_secret) {
        winGame();
    }
    else if (g_currentRow == MAX_ROWS - 1) {
        loseGame();
    }
    return true;
}
function pageKeyboardEvents() {
    function _onkeyupEvent(event) {
        if (g_currentRow >= MAX_ROWS) {
            return null;
        }
        let key = event.key;
        if (!/[a-z]/.test(key) && ["Enter", "Backspace"].indexOf(key) == -1) {
            return null;
        }
        console.log(key);
        if (/^[a-z]$/.test(key) && g_currentTile < MAX_TILES) {
            let tileElem = document.querySelector(`#tile_r${g_currentRow}t${g_currentTile}`);
            tileElem.textContent = key.toUpperCase();
            g_guess += key;
            g_currentTile++;
            return null;
        }
        if (key == "Backspace" && g_currentTile > 0) {
            let tileElem = document.querySelector(`#tile_r${g_currentRow}t${g_currentTile - 1}`);
            tileElem.textContent = "";
            g_guess = g_guess.slice(0, g_guess.length - 1);
            g_currentTile--;
            return null;
        }
        if (key == "Enter" && g_currentRow < MAX_ROWS) {
            console.log(g_guess);
            if (compareGuessToSecret(g_guess)) {
                g_guess = "";
                g_currentRow++;
                g_currentTile = 0;
            }
        }
        return null;
    }
    document.body.onkeyup = (e) => _onkeyupEvent(e);
    return;
}
function setupGameTiles() {
    let board = document.querySelector(".gameBoard");
    for (let i = 0; i < MAX_ROWS; i++) {
        // Row
        let newRow = document.createElement("div");
        newRow.classList.add("row");
        newRow.id = `tile_r${i}`;
        for (let j = 0; j < MAX_TILES; j++) {
            //Tiles
            let newTile = document.createElement("div");
            newTile.classList.add("tile");
            newTile.id = `tile_r${i}t${j}`;
            newTile.textContent = "";
            newTile.dataset.state = "none" /* LetterState["INITIAL"] */;
            newTile.style.backgroundColor = "#818384" /* LetterColour["GREY"] */;
            newRow.appendChild(newTile);
        }
        board.appendChild(newRow);
    }
    return;
}
function setupKeyboardModule() {
    const keySet = {
        0: [..."qwertyuiop"],
        1: [..."asdfghjkl"],
        2: ["enter", ..."zxcvbnm", "del"],
    };
    let keyboardModule = document.querySelector(".keyboardModule");
    for (let row in keySet) {
        let newRowElem = document.createElement("div");
        newRowElem.className = "keyboardRow";
        for (let key of keySet[row]) {
            let newKeyElem = document.createElement("div");
            newKeyElem.className = "keyboardKey";
            newKeyElem.id = `keyboardKey_${key}`;
            newKeyElem.textContent = key.toUpperCase();
            newKeyElem.style.backgroundColor = "#818384" /* LetterColour["GREY"] */;
            if (["enter", "del"].indexOf(key) != -1) {
                newKeyElem.style.fontSize = "16px";
            }
            newRowElem.appendChild(newKeyElem);
        }
        keyboardModule.appendChild(newRowElem);
    }
    return;
}
// Script load
console.log(`Secret: ${g_secret}`);
setupHTMLElements();
setupEventListeners();
