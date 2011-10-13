var SQUARE_SIZE = 32;
var GRID_HEIGHT = 8;
var GRID_WIDTH = 11; // 8 columns on the board + 3 for out-of-play checkers

var canvas = document.getElementById("canvas");
// 1 pixel border around everything
canvas.width = SQUARE_SIZE * GRID_WIDTH + 2;
canvas.height = SQUARE_SIZE * GRID_HEIGHT + 2;
var context = canvas.getContext('2d');

function Checker(color, position) {
  this.color = color;
  this.position = position;
}

Checker.prototype.r = 10;

Checker.prototype.draw = function () {
  var p = this.position;
  context.save();
  context.beginPath();
  context.arc(p.x, p.y, this.r, 0, 2 * Math.PI, false);
  context.fillStyle = this.color;
  context.fill();
  context.restore();
};

var disk = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 10,
  style: 'red',
  setPosition: function (coordinates) {
    this.x = coordinates.x;
    this.y = coordinates.y;
  }
};
var dragging = false;

function Range(min, max) {
  if (max < min) {
    throw new Error("Range(): " + max + " < " + min);
  }
  this.max = max;
  this.min = min;
}

Range.prototype.truncate = function (x) {
  return Math.max(this.min, Math.min(this.max, x));
}

function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.add = function (other) {
  return new Point(this.x + other.x, this.y + other.y);
};

Point.prototype.sub = function (other) {
  return new Point(this.x - other.x, this.y - other.y);
};

Point.prototype.mul = function (other) {
  return new Point(this.x * other.x, this.y * other.y);
};

function PointRange(xMin, xMax, yMin, yMax) {
  this.xRange = new Range(xMin, xMax);
  this.yRange = new Range(yMin, yMax);
}

PointRange.prototype.truncate = function (point) {
  var x, y;
  return new Point(
      this.xRange.truncate(point.x),
      this.yRange.truncate(point.y));
};

var CANVAS_RANGE = new PointRange(0, canvas.width, 0, canvas.height);
function truncateToCanvas(point) {
  return CANVAS_RANGE.truncate(point);
}

function onMouseDown(event) {
  var mouseCoordinates = getMouseCoordinates(event);
  if (isWithinDisk(mouseCoordinates)) {
    dragging = true;
    disk.setPosition(mouseCoordinates);
  }
}

function onMouseUp(event) {
  var mouseCoordinates = getMouseCoordinates(event);
  if (dragging) {
    dragging = false;
    disk.setPosition(closestSquareCenter(mouseCoordinates));
  }
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
  var COLOR = ['#880', '#FFA'];
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

/**
 * Returns the Point representing the indices of the closest square.
 * 
 * point must be expressed in canvas coordinates
 * return value is expressed as square indices
 */
function closestSquare(point) {
  // constrain point within inner box containing the squares
  point = new PointRange(
      1, SQUARE_SIZE * GRID_WIDTH,
      1, SQUARE_SIZE * GRID_HEIGHT)
          .truncate(point);
  // rezero at top-left of first square
  point = point.sub(new Point(1, 1));
  return new Point(
    Math.floor(point.x / SQUARE_SIZE),
    Math.floor(point.y / SQUARE_SIZE)
  );
}

/**
 * Returns center point of the closest square.
 */
function closestSquareCenter(point) {
  var square = closestSquare(point);
  // multiply to get top-left point of square
  // then add half size to get center
  return square.mul(new Point(SQUARE_SIZE, SQUARE_SIZE))
      .add(new Point(SQUARE_SIZE / 2, SQUARE_SIZE / 2));
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