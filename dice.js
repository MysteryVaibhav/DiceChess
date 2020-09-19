var board = null
var game = new Chess()
var dicesToMove = []
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')


function resetBoard () {
  var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
  }
  board = Chessboard('myBoard', config)
  game = new Chess()
  dicesToMove = []
  var currPiece = null
  updateStatus()
}

function flip () {
  board.flip()
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
  var move = game.move({
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
  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
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

    if (game.turn() === 'b') {
      dicesToMove.forEach(piece => document.getElementById('dice').innerHTML += "<img src=img/chesspieces/wikipedia/b" + piece + ".png>")
    } else {
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
