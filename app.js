const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')

let wordle

const getWordle = () => {
  fetch('http://localhost:8000/word')
    .then(response => response.json())
    .then(json => {
      console.log(json)
      wordle = json.toUpperCase()
    })
    .catch(err => console.log(err))
}

getWordle()


const keys = [
  'Q',
  'W',
  'E',
  'R',
  'T',
  'Y',
  'U',
  'I',
  'O',
  'P',
  'A',
  'S',
  'D',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'ENTER',
  'Z',
  'X',
  'C',
  'V',
  'B',
  'N',
  'M',
  '«',
]


const guessRows = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
]
let currentRow = 0
let currentTile = 0
let isGameOver = false

/* creates the grid - creates 6 empty rows (from the above array) 'rowElement', then each row has 6 empty tiles within 'tile' */

guessRows.forEach((guessRow, guessRowIndex) => {
  const rowElement = document.createElement('div')
  rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)
  guessRow.forEach((_guess, guessIndex) => {
    const tileElement = document.createElement('div')
    tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
    tileElement.classList.add('tile')
    rowElement.append(tileElement)
  })
  tileDisplay.append(rowElement)
})

/* creates the keyboard to type the buttons - from the above elements */

keys.forEach(key => {
  const buttonElement = document.createElement('button')
  buttonElement.textContent = key
  buttonElement.setAttribute('id', key)
  buttonElement.addEventListener('click', () => handleClick(key))
  keyboard.append(buttonElement)
})

/* the key clicked, then grabs the letter and puts it into ' letter' */

const handleClick = (letter) => {
  if (!isGameOver) {
    if (letter === '«') {
      deleteLetter()
      return
    }
    if (letter === 'ENTER') {
      checkRow()
      return
    }
    addLetter(letter)
  }
}

/* grabs the 'letter' and adds it to the current tile */

const addLetter = (letter) => {
  if (currentTile < 5 && currentRow < 6) {
    const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
    tile.textContent = letter
    guessRows[currentRow][currentTile] = letter
    tile.setAttribute('data', letter)
    currentTile++
  }
}

const deleteLetter = () => {
  if (currentTile > 0) {
    currentTile--
    const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
    tile.textContent = ''
    guessRows[currentRow][currentTile] = ''
    tile.setAttribute('data', '')
  }
}

const checkRow = () => {
  const guess = guessRows[currentRow].join('')
  console.log('guess', guess);
  if (currentTile > 4) {
    fetch(`http://localhost:8000/check/?word=${guess}`)
      .then(response => response.json())
      .then(json => {
        if (json == 'Entry word not found') {
          showMessage("That's not a word try again!")
          return
        } else {
          flipTile()
          if (wordle == guess) {
            showMessage('Magnificent!')
            isGameOver = true
            return
          } else {
            if (currentRow >= 5) {
              isGameOver = true
              showMessage('Game Over')
              return
            }
            if (currentRow < 5) {
              currentRow++
              currentTile = 0
            }
          }
        }
      }).catch(err => console.log(err))
  }


  const showMessage = (message) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement), 5000)
}

  /* checks the tile data against the correct answer and colours the keyboard if correct*/

  const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

  /* gets the tile data from the guess and see if any of them are correct, or in the right place. puts the guess into a new array, checks the word against the wordle word, if correct green, if rigth letter wrong place yellow. if colour changes, it is removed from the array so its not duplicated  */

  const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
    let checkWordle = wordle
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({letter: tile.getAttribute('data'), color: 'grey-overlay'})
    })

    guess.forEach((guess, index) => {
        if (guess.letter == wordle[index]) {
            guess.color = 'green-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    guess.forEach(guess => {
        if (checkWordle.includes(guess.letter)) {
            guess.color = 'yellow-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    rowTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('flip')
            tile.classList.add(guess[index].color)
            addColorToKey(guess[index].letter, guess[index].color)
        }, 500 * index)
    })
  }
}