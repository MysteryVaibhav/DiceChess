
// Initialization
var board = null;
var game = new Chess ();
var inProgress = true;
var dicesToMove = [];

// Functions
function bookKeeping() {
  if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
    document.getElementById('turn').innerHTML = "Nobody wins! It's a draw";
    inProgress = false;
    return;
  }
  dicesToMove = [];
  if (game.turn() === 'b') {
    if (game.in_checkmate()) {
      inProgress = false;
      document.getElementById('turn').innerHTML = "White wins! Black is checkmated";
    } else {
      dicesToMove = rollDices();
      document.getElementById('turn').innerHTML = "Black to play";
      document.getElementById('dice').innerHTML = "";
      dicesToMove.forEach(piece => document.getElementById('dice').innerHTML += "<img src=img/chesspieces/wikipedia/b" + piece + ".png>");
    }
  } else {
    if (game.in_checkmate()) {
      inProgress = false;
      document.getElementById('turn').innerHTML = "Black wins! White is checkmated";
    } else {
      dicesToMove = rollDices();
      document.getElementById('turn').innerHTML = "White to play";
      document.getElementById('dice').innerHTML = "";
      dicesToMove.forEach(piece => document.getElementById('dice').innerHTML += "<img src=img/chesspieces/wikipedia/w" + piece + ".png>");
    }
  }
}

function isValidRoll(piece) {
  var moves = game.moves();
  for (var i=0; i<moves.length; i++) {
    if (moves[i].length == 2 && piece === 'P') {
      return true;
    }
    if (moves[i].length == 2 && piece === moves[i].charAt(0)) {
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

function resetBoard() {
  board = Chessboard('board', config);
  game = new Chess ();
  inProgress = true;
  bookKeeping();
}

function onDrop (source, target, piece, newPos, oldPos, orientation) {
  // console.log('Source: ' + source)
  // console.log('Target: ' + target)
  // console.log('Piece: ' + piece)
  // console.log('New position: ' + Chessboard.objToFen(newPos))
  // console.log('Old position: ' + Chessboard.objToFen(oldPos))
  // console.log('Orientation: ' + orientation)
  // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

  var currTurn = game.turn();
  var isValidMove = game.move({ from: source, to: target, promotion: 'q'});
  if (isValidMove === null || !inProgress) {
    // don't move
    return 'snapback';
  }
  // if (!(currTurn + dicesToMove[0] === piece || currTurn + dicesToMove[1] === piece || currTurn + dicesToMove[2] === piece)) {
  //   game.undo();
  //   return 'snapback';
  // }

  bookKeeping();
}


// Game
var config = {
  draggable: true,
  position: 'start',
  onDrop: onDrop
}

board = Chessboard('board', config);
bookKeeping();
$('#startPositionBtn').on('click', resetBoard)
$('#flipOrientationBtn').on('click', board.flip)
