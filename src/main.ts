import { getWordOfTheDay, getGarble, checkIsGarble, answers, allowedGuesses } from './words.js'

const MAX_ROWS = 10
const MAX_TILES = 5

const enum LetterState{
    INITIAL = "none",
    MISSING = "missing",
    PRESENT = "present",
    CORRECT = "correct",
}

const enum LetterColour{
    YELLOW = "#b59f3b",
    GREEN = "#538d4e",
    DARKGREY = "#3a3a3c",
    GREY = "#818384",
    ORANGERED = "#C43500",
}

const gratzMsg = [
    "Well done!",
    "Amazing",
    "Good job",
    "Splendid",
    "Magnificient",
    ":)",
    "Bravo!",
    "GG",
]

const loserMsg = [
    "Better luck next time...",
    "Failure.",
    "Git gud",
    "Thanks for playing!",
    "GG",
]

var g_currentRow: number = 0
var g_currentTile: number = 0
var g_guess: string = ""
var g_secret: string = getGarble()

function setupHTMLElements(){
    setupGameTiles()
    setupKeyboardModule()
    return
}

function setupEventListeners(){
    pageKeyboardEvents()
    infoEvents()
    return
}

function checkGuessIsValid( guess: string ):boolean{
    let rowElem = document.getElementById(`row_r${g_currentRow}`) as HTMLDivElement
    if( guess.length != MAX_TILES ){
        popupMessage("Too Short!", 2)
        console.log("Guess has incorrect length - BAD")
        animateBadRow(rowElem);
        return false
    }
    
    if( ! checkIsGarble(guess) ){
        popupMessage("Musn't be a word!", 2)
        console.log("Guess is NOT Garble - BAD")
        animateBadRow(rowElem);
        return false
    }
    
    return true
}

function popupMessage(message: string, duration: number){
    let msgElem = document.querySelector(".popupMsg") as HTMLDivElement
    msgElem.textContent = message
    msgElem.classList.remove("hidden")
    msgElem.classList.add("visible")
    setTimeout(() => {
        msgElem.classList.add("hidden")
        msgElem.classList.remove("visible")
        return null
    }, duration * 1000);
    return
}

function animateBadRow(rowElem: HTMLDivElement){
    let duration = 0.5
    rowElem.style.animation = `shake ${duration}s ease forwards`
    rowElem.style.boxShadow = `0px 0px 4px 2px ${LetterColour["ORANGERED"]}`
    setTimeout(() => {
        rowElem.style.animation = ""
        rowElem.style.boxShadow = ""
        return null
    }, duration * 1000);
    return
}

function winGame(){
    let msg = gratzMsg[Math.floor(Math.random() * gratzMsg.length)]
    popupMessage(msg, 5)
    console.log("GAME WON")
}

function loseGame(){
    let msg = loserMsg[Math.floor(Math.random() * gratzMsg.length)]
    popupMessage(msg, 3)
    setTimeout(() => {
        popupMessage(`Secret: ${g_secret}`,5)
    }, 3000);
    console.log("GAME LOST")
}

function compareGuessToSecret( guess: string ):boolean{
    if( ! checkGuessIsValid(guess) ){ return false}
    
    for(let index in Array.from(guess) ){
        let tile = document.getElementById(`tile_r${g_currentRow}t${index}`)
        let keyboardKey = document.querySelector(".keyboardModule").querySelector(`#keyboardKey_${guess[index]}`) as HTMLDivElement
        let timeout = Number(index) * 0.4 * 1000

        if( guess[index] == g_secret[index] ){
            setTimeout(() => {
                tile.dataset.state = LetterState["CORRECT"]
                tile.style.background = LetterColour["GREEN"]
                keyboardKey.style.backgroundColor = LetterColour["GREEN"]
                tile.style.animation = "flip 0.5s ease forwards"
            }, timeout)
            continue
        }
        if( g_secret.indexOf(guess[index]) != -1 ){
            setTimeout(() => {
                tile.dataset.state = LetterState["PRESENT"]
                tile.style.background = LetterColour["YELLOW"]
                keyboardKey.style.backgroundColor = LetterColour["YELLOW"]
                tile.style.animation = "flip 0.5s ease forwards"
            }, timeout)
            continue
        }
        
        if( true ){
            setTimeout(() => {
                keyboardKey.style.backgroundColor = LetterColour["DARKGREY"]
                tile.style.background = LetterColour["DARKGREY"]
                tile.dataset.state = LetterState["MISSING"]
                tile.style.animation = "flip 0.5s ease forwards"
            }, timeout)
            continue
        }
    }

    if( guess == g_secret ){
        g_currentRow = MAX_ROWS + 1 //terminate input checks
        setTimeout(() => {winGame()}, 2400)
    }
    else if( g_currentRow == MAX_ROWS - 1 ){
        g_currentRow = MAX_ROWS + 1 //terminate input checks
        setTimeout(() => {loseGame()}, 2400)
    }

    return true
}

function infoEvents(){
    function _hideInfo(){
        let infoSplashElem = document.getElementById("splashInfo") as HTMLDivElement
        infoSplashElem.style.display = "none"
        return null
    }

    function _showInfo(){
        let infoSplashElem = document.getElementById("splashInfo") as HTMLDivElement
        infoSplashElem.style.display = ""
        return null
    }

    let infoSplashElem = document.getElementById("splashInfo") as HTMLDivElement
    let buttonHideElem = document.getElementById("b_closePopupInfo") as HTMLButtonElement
    let buttonShowElem = document.getElementById("b_showPopupInfo") as HTMLButtonElement
    infoSplashElem.onclick = ()=>{ _hideInfo() }
    buttonHideElem.onclick = ()=>{ _hideInfo() }
    buttonShowElem.onclick = ()=>{ _showInfo() }
    return
}

function pageKeyboardEvents(){
    function _onkeyupEvent(event: KeyboardEvent){
        if(g_currentRow >= MAX_ROWS){ return null }
        let key = event.key
        if( ! /[a-z]/.test(key) && ["Enter", "Backspace"].indexOf(key) == -1 ){ return null }
        console.log(key)
        if(/^[a-z]$/.test(key) && g_currentTile < MAX_TILES){
            let tileElem = document.querySelector(`#tile_r${g_currentRow}t${g_currentTile}`) as HTMLDivElement
            tileElem.textContent = key.toUpperCase()
            g_guess += key
            g_currentTile++
            return null
        }
        
        if( key == "Backspace" && g_currentTile > 0 ){
            let tileElem = document.querySelector(`#tile_r${g_currentRow}t${g_currentTile-1}`) as HTMLDivElement
            tileElem.textContent = ""
            g_guess = g_guess.slice( 0, g_guess.length-1 )
            g_currentTile--
            return null
        }
        
        if( key == "Enter" && g_currentRow < MAX_ROWS){
            console.log(g_guess)
            if( compareGuessToSecret( g_guess ) ){
                g_guess = ""
                g_currentRow++
                g_currentTile = 0
            }
        }

        return null
    }
    document.body.onkeyup = (e)=>_onkeyupEvent(e)
    return
}

function setupGameTiles(){
    let board = document.querySelector(".gameBoard") as HTMLDivElement
    for(let i=0; i<MAX_ROWS; i++){
        // Row
        let newRow = document.createElement("div")
        newRow.classList.add("row")
        newRow.id = `row_r${i}`
        for(let j=0; j<MAX_TILES; j++){
            //Tiles
            let newTile = document.createElement("div")
            newTile.classList.add("tile")
            newTile.id = `tile_r${i}t${j}`
            newTile.textContent = ""
            newTile.dataset.state = LetterState["INITIAL"]
            newTile.style.backgroundColor = LetterColour["GREY"]
            newRow.appendChild(newTile)
        }
        board.appendChild(newRow)
    }
    return
}

function setupKeyboardModule(){
    const keySet = {
        0: [..."qwertyuiop"],
        1: [..."asdfghjkl"],
        2: ["enter", ..."zxcvbnm", "del"],
    }
    let keyboardModule = document.querySelector(".keyboardModule") as HTMLDivElement
    for( let row in keySet ){
        let newRowElem = document.createElement("div")
        newRowElem.className = "keyboardRow"
        for( let key of keySet[row] ){
            let newKeyElem = document.createElement("div")
            newKeyElem.className = "keyboardKey"
            newKeyElem.id = `keyboardKey_${key}`
            newKeyElem.textContent = key.toUpperCase()
            newKeyElem.style.backgroundColor = LetterColour["GREY"]
            if( ["enter","del"].indexOf(key) != -1 ){
                newKeyElem.style.fontSize = "16px"
                newKeyElem.id = `${key}Key`
            }
            newRowElem.appendChild(newKeyElem)
        }
        keyboardModule.appendChild(newRowElem)
    }
    return
}

// Script load
console.log(`Secret: ${g_secret}`)
setupHTMLElements()
setupEventListeners()