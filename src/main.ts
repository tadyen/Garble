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
}

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
    return
}

function checkGuessIsValid( guess: string ):boolean{
    if( guess.length != MAX_TILES ){
        console.log("Guess has incorrect length - BAD")
        return false
    }
    
    if( ! checkIsGarble(guess) ){
        console.log("Guess is NOT Garble - BAD")
        return false
    }
    
    return true
}

function winGame(){
    console.log("GAME WON")
}

function loseGame(){
    console.log("GAME LOST")
}

function compareGuessToSecret( guess: string ):boolean{
    if( ! checkGuessIsValid(guess) ){ return false}
    
    for(let index in Array.from(guess) ){
        let tile = document.getElementById(`tile_r${g_currentRow}t${index}`)
        let keyboardKey = document.querySelector(".keyboardModule").querySelector(`#keyboardKey_${guess[index]}`) as HTMLDivElement
        let timeout = Number(index) * 0.4 * 1000

        /* @keyframes duration | easing-function | delay | name */
        // tile.style.animation = `0.5s ease forwards ${Number(index) * 0.4}s flip`
        
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
        newRow.id = `tile_r${i}`
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