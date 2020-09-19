var board = null
var game = new Chess()
var dicesToMove = []
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var $board = $('#myBoard')
var squareClass = 'square-55d63'
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'
var currPiece = null
var currMove = null
var autoOrientation = false
var isHighlight = true

function resetBoard () {
  var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
  }
  board = Chessboard('myBoard', config)
  game = new Chess()
  dicesToMove = []
  currPiece = null
  currMove = null
  updateStatus()
}

function flip () {
  board.flip()
}

function orientate () {
  if (autoOrientation) {
    document.getElementById('autoOrientation').innerHTML = "Auto Orientation is Off"
    autoOrientation = false;
  } else {
    document.getElementById('autoOrientation').innerHTML = "Auto Orientation is On"
    autoOrientation = true;
  }
}

function toHighlight () {
  if (isHighlight) {
    document.getElementById('highlights').innerHTML = "Highlights are Off"
    $board.find('.' + squareClass).removeClass('highlight-black')
    $board.find('.' + squareClass).removeClass('highlight-white')
    isHighlight = false;
  } else {
    document.getElementById('highlights').innerHTML = "Highlights are On"
    isHighlight = true;
  }
}

function isValidRoll(piece) {
  var moves = game.moves();
  for (var i=0; i<moves.length; i++) {
    if (moves[i].charAt(0).toLowerCase() === moves[i].charAt(0) && piece === 'P') {
      return true;
    }
    if (moves[i].charAt(0).toUpperCase() === moves[i].charAt(0) && piece === moves[i].charAt(0)) {
      return true;
    }
  }
  return false;
}

function rollDices() {
  var map = {1:"P", 2:"N", 3:"K", 4:"Q", 5:"R", 6:"B"};
  var throws = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
  while (! (isValidRoll(map[throws[0]]) || isValidRoll(map[throws[1]]) || isValidRoll(map[throws[2]]))) {
    throws = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
  }
  return [map[throws[0]], map[throws[1]], map[throws[2]]];
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
  currPiece = piece;
}

function onDrop (source, target) {
  var currTurn = game.turn();
  // see if the move is legal
  move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'
  if (!(currTurn + dicesToMove[0] === currPiece || currTurn + dicesToMove[1] === currPiece || currTurn + dicesToMove[2] === currPiece)) {
    game.undo();
    return 'snapback';
  }
  currMove = move;
  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onMouseoverSquare (square, piece) {
  if (isHighlight) {
    // get list of possible moves for this square
    var moves = game.moves({
      square: square,
      verbose: true
    })

    // exit if there are no moves available for this square
    if (moves.length === 0) return

    // highlight the square they moused over
    if (game.turn() + dicesToMove[0] == piece || game.turn() + dicesToMove[1] == piece || game.turn() + dicesToMove[2] == piece) {
      greySquare(square)
    }

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].piece.toUpperCase() === dicesToMove[0] || moves[i].piece.toUpperCase() === dicesToMove[1] || moves[i].piece.toUpperCase() === dicesToMove[2]) {
        greySquare(moves[i].to)
      }

    }
  }
}

function onMouseoutSquare (square, piece) {
  if (isHighlight) {
    removeGreySquares()
  }
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }

    // Roll dices
    dicesToMove = rollDices();
    document.getElementById('dice').innerHTML = "";

    // Highlight last move
    if (isHighlight) {
      if (currMove !== null && currMove.color === 'w') {
        $board.find('.' + squareClass).removeClass('highlight-white')
        $board.find('.square-' + currMove.from).addClass('highlight-white')
        $board.find('.square-' + currMove.to)
          .addClass('highlight-' + 'white')
      } else if (currMove !== null && currMove.color === 'b') {
        $board.find('.' + squareClass).removeClass('highlight-black')
        $board.find('.square-' + currMove.from).addClass('highlight-black')
        $board.find('.square-' + currMove.to)
          .addClass('highlight-' + 'black')
      }
    }

    if (game.turn() === 'b') {
      if (autoOrientation) {
        board.orientation('black')
      }
      // Roll Dice
      dicesToMove.forEach(piece => document.getElementById('dice').innerHTML += "<img src=img/chesspieces/wikipedia/b" + piece + ".png>")
    } else {
      if (autoOrientation) {
        board.orientation('white')
      }
      //Roll dice
      dicesToMove.forEach(piece => document.getElementById('dice').innerHTML += "<img src=img/chesspieces/wikipedia/w" + piece + ".png>")
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

resetBoard()

$('#startPositionBtn').on('click', resetBoard)
$('#flipOrientationBtn').on('click', flip)
$('#autoOrientation').on('click', orientate)
$('#highlights').on('click', toHighlight)
