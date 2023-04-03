import { getGarble, checkIsGarble } from './words.js';
const MAX_ROWS = 10;
const MAX_TILES = 5;
const enterKey = { Enter: "enter" };
const delKey = { Backspace: "del" };
const gratzMsg = [
    "Well done!",
    "Amazing",
    "Good job",
    "Splendid",
    "Magnificient",
    ":)",
    "Bravo!",
    "GG",
];
const loserMsg = [
    "Better luck next time...",
    "Failure.",
    "Git gud",
    "Thanks for playing!",
    "GG",
];
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
    infoEvents();
    return;
}
function checkGuessIsValid(guess) {
    let rowElem = document.getElementById(`row_r${g_currentRow}`);
    if (guess.length != MAX_TILES) {
        popupMessage("Too Short!", 2);
        console.log("Guess has incorrect length - BAD");
        animateBadRow(rowElem);
        return false;
    }
    if (!checkIsGarble(guess)) {
        popupMessage("Musn't be a word!", 2);
        console.log("Guess is NOT Garble - BAD");
        animateBadRow(rowElem);
        return false;
    }
    return true;
}
function popupMessage(message, duration) {
    let msgElem = document.querySelector(".popupMsg");
    msgElem.textContent = message;
    msgElem.classList.remove("hidden");
    msgElem.classList.add("visible");
    setTimeout(() => {
        msgElem.classList.add("hidden");
        msgElem.classList.remove("visible");
        return null;
    }, duration * 1000);
    return;
}
function animateBadRow(rowElem) {
    let duration = 0.5;
    rowElem.style.animation = `shake ${duration}s ease forwards`;
    rowElem.style.boxShadow = `0px 0px 4px 2px ${"#C43500" /* LetterColour["ORANGERED"] */}`;
    setTimeout(() => {
        rowElem.style.animation = "";
        rowElem.style.boxShadow = "";
        return null;
    }, duration * 1000);
    return;
}
function winGame() {
    let msg = gratzMsg[Math.floor(Math.random() * gratzMsg.length)];
    popupMessage(msg, 5);
    console.log("GAME WON");
}
function loseGame() {
    let msg = loserMsg[Math.floor(Math.random() * loserMsg.length)];
    popupMessage(msg, 3);
    setTimeout(() => {
        popupMessage(`Secret: ${g_secret}`, 5);
    }, 3000);
    console.log("GAME LOST");
}
function colourFromState(state) {
    switch (state) {
        case "correct" /* LetterState["CORRECT"] */:
            return "#538d4e" /* LetterColour["GREEN"] */;
        case "present" /* LetterState["PRESENT"] */:
            return "#b59f3b" /* LetterColour["YELLOW"] */;
        case "missing" /* LetterState["MISSING"] */:
            return "#3a3a3c" /* LetterColour["DARKGREY"] */;
        case "none" /* LetterState["INITIAL"] */:
            return "#818384" /* LetterColour["GREY"] */;
        default:
            break;
    }
    return null;
}
function compareGuessToSecret(guess) {
    const tileDelay_s = 0.4;
    /** Prevent keyboard state from reverting to yellow or grey */
    function _updateKeyboardKeyState(key, state) {
        let oldState = key.dataset.state;
        // prevent continuation if already of a higher state
        switch (oldState) {
            case "correct" /* LetterState["CORRECT"] */:
                return;
            case "present" /* LetterState["PRESENT"] */:
                if (state == "missing" /* LetterState["MISSING"] */) {
                    return;
                }
            case "missing" /* LetterState["MISSING"] */:
                break;
            case "none" /* LetterState["INITIAL"] */:
                break;
            default:
                break;
        }
        // update state
        key.dataset.state = state;
        key.style.backgroundColor = colourFromState(state);
        return;
    }
    function _updateTileState(tile, state) {
        let duration_s = 0.5;
        let speedUp_s = duration_s / 2;
        tile.style.animation = `flip ${duration_s}s ease forwards`;
        tile.dataset.state = state;
        setTimeout(() => {
            tile.style.backgroundColor = colourFromState(state);
        }, (duration_s - speedUp_s) * 1000);
        return;
    }
    function _updateStates(guess, delay_s) {
        if (!checkGuessIsValid(guess)) {
            return false;
        }
        // bugfix yellow-tiles should be grey
        let rem = [...g_secret];
        for (let i = 0; i < MAX_TILES; i++) {
            if (guess[i] == g_secret[i]) {
                rem[i] = "";
            }
        }
        for (let i = 0; i < MAX_TILES; i++) {
            let tile = document.getElementById(`tile_r${g_currentRow}t${i}`);
            let keyboardKey = document.querySelector(`#keyboardKey_${guess[i]}`);
            let timeout = i * delay_s * 1000;
            if (guess[i] == g_secret[i]) {
                setTimeout(() => {
                    _updateKeyboardKeyState(keyboardKey, "correct" /* LetterState["CORRECT"] */);
                    _updateTileState(tile, "correct" /* LetterState["CORRECT"] */);
                }, timeout);
                continue;
            }
            if (rem.includes(guess[i])) {
                setTimeout(() => {
                    _updateKeyboardKeyState(keyboardKey, "present" /* LetterState["PRESENT"] */);
                    _updateTileState(tile, "present" /* LetterState["PRESENT"] */);
                }, timeout);
                continue;
            }
            if (true) {
                setTimeout(() => {
                    _updateKeyboardKeyState(keyboardKey, "missing" /* LetterState["MISSING"] */);
                    _updateTileState(tile, "missing" /* LetterState["MISSING"] */);
                }, timeout);
                continue;
            }
        }
        return true;
    }
    if (!_updateStates(guess, tileDelay_s)) {
        return false;
    }
    setTimeout(() => {
        if (guess == g_secret) {
            g_currentRow = MAX_ROWS + 1; //terminate input checks
            setTimeout(() => { winGame(); }, 2400);
        }
        else if (g_currentRow == MAX_ROWS) {
            g_currentRow = MAX_ROWS + 1; //terminate input checks
            setTimeout(() => { loseGame(); }, 2400);
        }
    }, tileDelay_s * MAX_TILES);
    return true;
}
function infoEvents() {
    function _hideInfo() {
        let infoSplashElem = document.getElementById("splashInfo");
        infoSplashElem.style.display = "none";
        return null;
    }
    function _showInfo() {
        let infoSplashElem = document.getElementById("splashInfo");
        infoSplashElem.style.display = "";
        return null;
    }
    let infoSplashElem = document.getElementById("splashInfo");
    let buttonHideElem = document.getElementById("b_closePopupInfo");
    let buttonShowElem = document.getElementById("b_showPopupInfo");
    infoSplashElem.onclick = () => { _hideInfo(); };
    buttonHideElem.onclick = () => { _hideInfo(); };
    buttonShowElem.onclick = () => { _showInfo(); };
    return;
}
function pageKeyboardEvents() {
    function _onkeyupEvent(event) {
        if (g_currentRow >= MAX_ROWS) {
            return null;
        }
        let key = event.key;
        if (!/^[a-z]$/.test(key) && ["Enter", "Backspace"].indexOf(key) == -1) {
            return null;
        }
        console.log(`key accepted: ${key}`);
        //keyboardModuleKeys
        let keyboardModuleKey;
        if (key == "Enter") {
            keyboardModuleKey = document.querySelector(`#keyboardKey_${enterKey["Enter"]}`);
        }
        if (key == "Backspace") {
            keyboardModuleKey = document.querySelector(`#keyboardKey_${delKey["Backspace"]}`);
        }
        if (/^[a-z]$/.test(key)) {
            keyboardModuleKey = document.querySelector(`#keyboardKey_${key}`);
        }
        keyboardModuleKey.style.scale = "105%";
        setTimeout(() => {
            keyboardModuleKey.style.scale = "";
        }, 0.1 * 1000);
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
            console.log(`Guess accepted: ${g_guess}`);
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
        newRow.id = `row_r${i}`;
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
        2: [enterKey["Enter"], ..."zxcvbnm", delKey["Backspace"]],
    };
    function _inKeySet(key) {
        let set = [];
        for (let index in keySet) {
            set.push(...keySet[index]);
        }
        if (set.includes(key)) {
            return true;
        }
        else {
            return false;
        }
    }
    function _onclick(e) {
        let elem = e.target;
        let keyVal = elem.textContent.toLocaleLowerCase();
        if (!_inKeySet(keyVal)) {
            return;
        }
        if (keyVal == enterKey["Enter"]) {
            document.body.dispatchEvent(new KeyboardEvent('keyup', { 'key': "Enter" }));
            return;
        }
        if (keyVal == delKey["Backspace"]) {
            document.body.dispatchEvent(new KeyboardEvent('keyup', { 'key': "Backspace" }));
            return;
        }
        document.body.dispatchEvent(new KeyboardEvent('keyup', { 'key': keyVal }));
        return;
    }
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
            newKeyElem.dataset.state = "none" /* LetterState["INITIAL"] */;
            newKeyElem.onclick = (e) => _onclick(e);
            if ([enterKey, delKey].includes(key)) {
                newKeyElem.style.fontSize = "16px";
                newKeyElem.id = `${key}Key`;
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
