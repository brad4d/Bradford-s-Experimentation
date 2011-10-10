var SQUARE_SIZE = 32;
var GRID_HEIGHT = 8;
var GRID_WIDTH = 11; // 8 columns on the board + 3 for out-of-play checkers

var canvas = document.getElementById("canvas");
// 1 pixel border around everything
canvas.width = SQUARE_SIZE * GRID_WIDTH + 2;
canvas.height = SQUARE_SIZE * GRID_HEIGHT + 2;
var context = canvas.getContext('2d');
var canvasRect = {
  x: 0,
  y: 0,
  height: canvas.height,
  width: canvas.width
};

var disk = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 10,
  style: 'ff0',
  setPosition: function (coordinates) {
    this.x = coordinates.x;
    this.y = coordinates.y;
  }
};
var dragging = false;

function truncateToCanvas(coordinates) {
  var x = Math.max(0, Math.min(coordinates.x, canvas.width));
  var y = Math.max(0, Math.min(coordinates.y, canvas.height));
  return {x: x, y: y};
}
function onMouseDown(event) {
  var mouseCoordinates = getMouseCoordinates(event);
  if (isWithinDisk(mouseCoordinates)) {
    dragging = true;
    disk.setPosition(mouseCoordinates);
  }
}

function onMouseUp(event) {
  dragging = false;
}

function onMouseMove(event) {
  var mouseCoordinates = getMouseCoordinates(event);
  if (dragging) {
    disk.setPosition(truncateToCanvas(mouseCoordinates));
  }
}


function getMouseCoordinates(event) {
  var x, y;
  x = event.clientX;
  y = event.clientY;
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  return {x: x, y: y};
}

function isWithinDisk(coordinates) {
  return distance(disk, coordinates) < disk.r;
}

function distance(c1, c2) {
  var dx = c1.x - c2.x;
  var dy = c1.y - c2.y;
  
  return Math.sqrt(dx*dx + dy*dy);
}

function clear() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawDisk() {
  context.save();
  context.beginPath();
  context.arc(disk.x, disk.y, disk.r, 0, 2 * Math.PI, false);
  context.fillStyle = disk.style;
  context.fill();
  context.restore();
}

function drawBoard() {
  var x = 0, y = 0;
  var COLOR = ['#fff', '#000'];
  for (x = 0; x < 8; ++x) {
    for (y = 0; y < 8; ++y) {
      context.fillStyle = COLOR[(x + y) % 2];
      context.fillRect(
          // +1 for outer border, +1 for border around individual square
          x * SQUARE_SIZE + 2,
          y * SQUARE_SIZE + 2,
          // -2 for border within square
          SQUARE_SIZE - 2,
          SQUARE_SIZE - 2);
    }
  }
}

function redraw() {
  clear();
  drawBoard();
  drawDisk();
}

window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);
window.addEventListener('mousemove', onMouseMove, false);
setInterval(redraw, 10);
redraw();