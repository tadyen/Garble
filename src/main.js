import { getGarble, checkIsGarble } from './words.js';
var MAX_ROWS = 6;
var MAX_TILES = 5;
var g_currentRow = 0;
var g_currentTile = 0;
var g_guess = "";
var g_secret = getGarble();
function setupHTMLElements() {
    setupGameTiles();
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
function compareGuessToSecret(guess) {
    if (!checkGuessIsValid(guess)) {
        return false;
    }
    return true;
}
function pageKeyboardEvents() {
    function _onkeyupEvent(event) {
        if (g_currentRow >= MAX_ROWS) {
            return null;
        }
        var key = event.key;
        if (!/[a-z]/.test(key) && ["Enter", "Backspace"].indexOf(key) == -1) {
            return null;
        }
        console.log(key);
        if (/^[a-z]$/.test(key) && g_currentTile < MAX_TILES) {
            var tileElem = document.querySelector("#tile_r".concat(g_currentRow, "t").concat(g_currentTile));
            var pElem = tileElem.querySelector("p");
            pElem.textContent = key.toUpperCase();
            g_guess += key;
            g_currentTile++;
            return null;
        }
        if (key == "Backspace" && g_currentTile > 0) {
            var tileElem = document.querySelector("#tile_r".concat(g_currentRow, "t").concat(g_currentTile - 1));
            var pElem = tileElem.querySelector("p");
            pElem.textContent = "";
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
    document.body.onkeyup = function (e) { return _onkeyupEvent(e); };
    return;
}
function setupGameTiles() {
    var board = document.querySelector(".gameBoard");
    for (var i = 0; i < MAX_ROWS; i++) {
        // Row
        var newRow = document.createElement("div");
        newRow.classList.add("row");
        newRow.id = "tile_r".concat(i);
        for (var j = 0; j < MAX_TILES; j++) {
            //Tiles
            var newTile = document.createElement("div");
            newTile.classList.add("tile");
            newTile.id = "tile_r".concat(i, "t").concat(j);
            var newP = document.createElement("p");
            newTile.appendChild(newP);
            newRow.appendChild(newTile);
        }
        board.appendChild(newRow);
    }
    return;
}
// Script load
console.log("Secret: ".concat(g_secret));
setupHTMLElements();
setupEventListeners();
