import { getWordOfTheDay, getGarble, checkIsGarble, answers, allowedGuesses } from './words.js'

const MAX_ROWS = 6
const MAX_TILES = 5

var g_currentRow: number = 0
var g_currentTile: number = 0
var g_guess: string = ""
var g_secret: string = getGarble()

function setupHTMLElements(){
    setupGameTiles()
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

function compareGuessToSecret( guess: string ):boolean{
    if( ! checkGuessIsValid(guess) ){ return false}
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
            let pElem = tileElem.querySelector("p") as HTMLParagraphElement
            pElem.textContent = key.toUpperCase()
            g_guess += key
            g_currentTile++
            return null
        }
        
        if( key == "Backspace" && g_currentTile > 0 ){
            let tileElem = document.querySelector(`#tile_r${g_currentRow}t${g_currentTile-1}`) as HTMLDivElement
            let pElem = tileElem.querySelector("p") as HTMLParagraphElement
            pElem.textContent = ""
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
            let newP = document.createElement("p")
            newTile.appendChild(newP)
            newRow.appendChild(newTile)
        }
        board.appendChild(newRow)
    }
    return
}

// Script load
console.log(`Secret: ${g_secret}`)
setupHTMLElements()
setupEventListeners()