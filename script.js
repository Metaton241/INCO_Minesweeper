// Game configuration
const ROWS = 10;
const COLS = 10;
const MINES_COUNT = 10;

// Game state
let board = [];
let mines = [];
let revealedCount = 0;
let flaggedCount = 0;
let gameOver = false;
let gameStarted = false;
let timer = 0;
let timerInterval;

// Leaderboard data
const leaderboardData = [
    { rank: 1, player: "M3TATON", time: 18 },
    { rank: 2, player: "Sparlex", time: 45 },
    { rank: 3, player: "MineMaster", time: 67 },
    { rank: 4, player: "BoomDefuser", time: 89 },
    { rank: 5, player: "FlagFinder", time: 120 },
    { rank: 6, player: "SafeClicker", time: 156 }
];

// DOM elements
const gameBoard = document.getElementById('game-board');
const minesCountElement = document.getElementById('mines-count');
const timerElement = document.getElementById('timer');
const resetButton = document.getElementById('reset-button');
const leaderboardBody = document.getElementById('leaderboard-body');

// Initialize the game
function initGame() {
    // Reset game state
    board = [];
    mines = [];
    revealedCount = 0;
    flaggedCount = 0;
    gameOver = false;
    gameStarted = false;
    timer = 0;
    timerElement.textContent = timer;
    
    // Clear the board
    gameBoard.innerHTML = '';
    
    // Clear timer if running
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Update reset button
    resetButton.textContent = '😊';
    
    // Update mines count
    minesCountElement.textContent = MINES_COUNT;
    
    // Create the board
    createBoard();
    
    // Render the board
    renderBoard();
    
    // Render leaderboard
    renderLeaderboard();
}

// Create the game board
function createBoard() {
    // Initialize empty board
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }
}

// Place mines on the board (after first click to ensure first click is safe)
function placeMines(firstClickRow, firstClickCol) {
    let minesPlaced = 0;
    
    while (minesPlaced < MINES_COUNT) {
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);
        
        // Don't place mine on first click or if already has mine
        if ((row === firstClickRow && col === firstClickCol) || board[row][col].isMine) {
            continue;
        }
        
        board[row][col].isMine = true;
        mines.push({ row, col });
        minesPlaced++;
        
        // Update neighbor counts
        updateNeighbors(row, col);
    }
}

// Update neighbor mine counts
function updateNeighbors(row, col) {
    for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
            if (r === row && c === col) continue;
            board[r][c].neighborMines++;
        }
    }
}

// Render the game board
function renderBoard() {
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const cellData = board[row][col];
            
            if (cellData.isRevealed) {
                cell.classList.add('revealed');
                
                if (cellData.isMine) {
                    cell.classList.add('mine');
                } else if (cellData.neighborMines > 0) {
                    cell.textContent = cellData.neighborMines;
                    cell.classList.add(`cell-${cellData.neighborMines}`);
                }
            } else if (cellData.isFlagged) {
                cell.classList.add('flagged');
            }
            
            // Add event listeners
            cell.addEventListener('click', () => handleCellClick(row, col));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(row, col);
            });
            
            gameBoard.appendChild(cell);
        }
    }
}

// Render the leaderboard
function renderLeaderboard() {
    leaderboardBody.innerHTML = '';
    
    leaderboardData.forEach(entry => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${entry.rank}</td>
            <td>${entry.player}</td>
            <td>${entry.time}</td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

// Handle cell click
function handleCellClick(row, col) {
    if (gameOver || board[row][col].isRevealed || board[row][col].isFlagged) {
        return;
    }
    
    // Start the game and timer on first click
    if (!gameStarted) {
        gameStarted = true;
        placeMines(row, col);
        startTimer();
    }
    
    const cell = board[row][col];
    
    if (cell.isMine) {
        // Game over
        cell.isRevealed = true;
        revealAllMines();
        gameOver = true;
        resetButton.textContent = '😵';
        clearInterval(timerInterval);
        showLoseMessage();
        return;
    }
    
    revealCell(row, col);
    
    // Check for win
    if (revealedCount === ROWS * COLS - MINES_COUNT) {
        gameOver = true;
        resetButton.textContent = '😎';
        clearInterval(timerInterval);
        showWinMessage();
    }
    
    renderBoard();
}

// Reveal a cell and its neighbors if empty
function revealCell(row, col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS || board[row][col].isRevealed || board[row][col].isFlagged) {
        return;
    }
    
    board[row][col].isRevealed = true;
    revealedCount++;
    
    // If cell has no neighboring mines, reveal neighbors
    if (board[row][col].neighborMines === 0) {
        for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                revealCell(r, c);
            }
        }
    }
}

// Handle right click (flag placement)
function handleRightClick(row, col) {
    if (gameOver || board[row][col].isRevealed) {
        return;
    }
    
    // Start the game and timer on first click
    if (!gameStarted) {
        gameStarted = true;
        placeMines(row, col);
        startTimer();
    }
    
    const cell = board[row][col];
    
    if (!cell.isFlagged && flaggedCount >= MINES_COUNT) {
        return; // Can't place more flags than mines
    }
    
    cell.isFlagged = !cell.isFlagged;
    flaggedCount += cell.isFlagged ? 1 : -1;
    
    // Update mines count display
    minesCountElement.textContent = MINES_COUNT - flaggedCount;
    
    renderBoard();
}

// Reveal all mines (when game is lost)
function revealAllMines() {
    mines.forEach(mine => {
        board[mine.row][mine.col].isRevealed = true;
    });
}

// Start the game timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerElement.textContent = timer;
    }, 1000);
}

// Show win message with name input for leaderboard
function showWinMessage() {
    const winMessage = document.createElement('div');
    winMessage.className = 'win-message';
    winMessage.id = 'win-message';
    winMessage.innerHTML = `
        <h2>Congratulations!</h2>
        <p>You won the game in ${timer} seconds!</p>
        <input type="text" id="player-name" placeholder="Enter your name" maxlength="20">
        <button onclick="submitScore()">Submit Score</button>
        <button onclick="closeWinMessage()">Play Again</button>
    `;
    document.body.appendChild(winMessage);
    winMessage.style.display = 'block';
}

// Submit score to leaderboard
function submitScore() {
    const playerNameInput = document.getElementById('player-name');
    const playerName = playerNameInput.value.trim() || 'Anonymous';
    
    // Add new score to leaderboard
    const newEntry = { rank: 0, player: playerName, time: timer };
    leaderboardData.push(newEntry);
    
    // Sort leaderboard by time
    leaderboardData.sort((a, b) => a.time - b.time);
    
    // Update ranks
    leaderboardData.forEach((entry, index) => {
        entry.rank = index + 1;
    });
    
    // Keep only top 10 scores
    if (leaderboardData.length > 10) {
        leaderboardData.splice(10);
    }
    
    // Re-render leaderboard
    renderLeaderboard();
    
    // Close message and reset game
    closeWinMessage();
}

// Close win message
function closeWinMessage() {
    const winMessage = document.getElementById('win-message');
    if (winMessage) {
        winMessage.remove();
    }
    initGame();
}

// Show lose message
function showLoseMessage() {
    const loseMessage = document.createElement('div');
    loseMessage.className = 'lose-message';
    loseMessage.id = 'lose-message';
    loseMessage.innerHTML = `
        <h2>Game Over!</h2>
        <p>You hit a mine. Try again!</p>
        <button onclick="closeLoseMessage()">Try Again</button>
    `;
    document.body.appendChild(loseMessage);
    loseMessage.style.display = 'block';
}

// Close lose message
function closeLoseMessage() {
    const loseMessage = document.getElementById('lose-message');
    if (loseMessage) {
        loseMessage.remove();
    }
    initGame();
}

// Event listener for reset button
resetButton.addEventListener('click', initGame);

// Initialize the game when page loads
window.addEventListener('DOMContentLoaded', initGame);