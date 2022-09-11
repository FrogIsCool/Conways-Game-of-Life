const canvas = document.getElementById('grid');
const context = canvas.getContext('2d');

const gridSize = 25;
const rectSize = canvas.height / gridSize; // Expects canvas to be square

var paused = true;

var grid = []; // Stores current generatin of cells
var nextGen = []; // Stores next generation of changes

// Initialize grid to 2d array of '-' and of length gridSize.
for (let i = 0; i < gridSize; i++) {
  let row = [];
  for (let j = 0; j < gridSize; j++) {
    row.push(false);
  }
  grid.push(row);
}
// Copies grid to nextGen
for (let i = 0; i < gridSize; i++) {
  let row = [];
  for (let j = 0; j < gridSize; j++) {
    row.push(grid[i][j]);
  }
  nextGen.push(row);
}

// Sets defualt cells alive
grid[2][0] = true;
grid[2][1] = true;
grid[2][2] = true;
grid[1][2] = true;
grid[0][1] = true;

/*
 * Counts the number of live cells surrounding the current cell.
 *
 * returns:  Number of live cells around current cell.
 * x: Row of cell to check.
 * y: Column of cell to check. */
function countNeighbors(x, y) {
  let count = 0;
  // Check 8 cells around main cell
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i == 0 && j == 0) continue; // Ignore main cell
      // Mod values of x and y to allow edge rapping and avoid
      // out of bounds excetion
      let currX = (x + i + gridSize) % gridSize;
      let currY = (y + j + gridSize) % gridSize;
      if (grid[currX][currY] == true) count++;
    }
  }
  return count;
}

/* Checks the health of the current cell by counting its neigbors.
 * If the current cell is alive and has 2 or 3 neighbors, it
 * survives. If the current cell is dead and has 3 neighbors, it 
 * becomes alive. Under any other count, the current cell stays
 * dead or dies. Stores changes in nextGen grid.
 *
 * x: Row of cell to check.
 * y: Column of cell to check. */
function updateCell(x, y) {
  let count = countNeighbors(x, y);
  if (count == 3) nextGen[x][y] = true;
  if (count == 2 && grid[x][y] == true) nextGen[x][y] = true
  if (count < 2 || count > 3) nextGen[x][y] = false;
}

/* Checks the health of every cell in the grid and stores
 * the updates in the next generation grid. */
function updateGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      updateCell(i, j);
    }
  }
}

/* Runs a single generations worth of calculations and updates
 * the grid with the next generation values accordingly. */
function generation() {
  updateGrid();
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = nextGen[i][j];
    }
  }
}

/* Pause for a period of milliseconds.
 * Used to control speed of game loop.
 * 
 * milliseconds: number of milliseconds to pause for. */
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/* Starts main game loop. Repeats checking cells health 
 * and updates the grid accordingly. Draws each generation's
 * cells and grid on the canvas. */
async function main() {
  do {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawCells();
    if (!paused) {
      generation();
    }
    await sleep(300);
  } while (true);
}

/* Draws the grid for the game on the HTML canvas. */
function drawGrid() {
  context.beginPath();
  for (let i = 1; i < gridSize; i++) {
    context.moveTo(rectSize * i, 0);
    context.lineTo(rectSize * i, canvas.height);
    context.moveTo(0, rectSize * i);
    context.lineTo(canvas.width, rectSize * i);
  }
  context.stroke();
}

/* Draws the alive cells onto the canvas. */
function drawCells() {
  context.beginPath();
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] == true) {
        context.rect(i * rectSize, j * rectSize, rectSize, rectSize);
      }
    }
  }
  context.fill();
}

/* Pause simulation if space key is pressed */
this.addEventListener('keypress', event => {
  if (event.code == 'Space') {
    play();
  }
});

/* Change cell state to alive when clicked on. */
canvas.addEventListener('click', event => {
  if (event.buttons == 0) {
    // Subtract rect from x and y to make them location relative
    // to the canvas
    let rect = canvas.getBoundingClientRect();
    // Translate cordinate to corresponding grid location
    let x = Math.floor((event.clientX - rect.left) / rectSize);
    let y = Math.floor((event.clientY - rect.top) / rectSize);
    grid[x][y] = true;
    // Imediately draw cell to avoid waiting for update
    context.beginPath();
    context.rect(x * rectSize, y * rectSize, rectSize, rectSize);
    context.fill();
  }
});

/* Plays or pauses the simulation. */
function play() {
  paused = !paused;
}

/* Resets the grid to all blank cells. */
function reset() {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      grid[i][j] = false;
    }
  }
}

main();