'use client'
import React, { useState, useEffect } from 'react';

export default function ConnectFourGame () {
  const ROWS = 6;
  const COLS = 7;
  
  const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(' ')));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [message, setMessage] = useState("Welcome to Connect Four!");
  const [aiThinking, setAiThinking] = useState(false);

  // Reset the game
  const resetGame = () => {
    setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(' ')));
    setCurrentPlayer('X');
    setGameOver(false);
    setWinner(null);
    setMessage(gameMode === 1 ? "Player 1's turn (X)" : "Your turn (X)");
  };

  // Initialize game based on selected mode
  const startGame = (mode) => {
    setGameMode(mode);
    resetGame();
    setMessage(mode === 1 ? "Player 1's turn (X)" : "Your turn (X)");
  };

  // Select AI difficulty
  const selectDifficulty = (level) => {
    const difficultyLevels = {1: 'easy', 2: 'medium', 3: 'hard'};
    setDifficulty(difficultyLevels[level]);
    startGame(2);
  };

  // Check if move is valid
  const isValidMove = (col) => {
    if (col < 0 || col >= COLS) return false;
    return board[0][col] === ' ';
  };

  // Get all valid moves
  const getValidMoves = () => {
    return Array.from({length: COLS}, (_, i) => i).filter(col => isValidMove(col));
  };

  // Make a move
  const makeMove = (col) => {
    if (!isValidMove(col) || gameOver) return false;
    
    const newBoard = board.map(row => [...row]);
    
    // Find the lowest empty row in the column
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === ' ') {
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);
        
        // Check for win
        if (checkWin(row, col, newBoard)) {
          setGameOver(true);
          setWinner(currentPlayer);
          setMessage(`Game over! ${currentPlayer === 'X' ? (gameMode === 1 ? "Player 1" : "You") : (gameMode === 1 ? "Player 2" : "AI")} (${currentPlayer}) wins!`);
          return true;
        }
        
        // Check for draw
        if (isBoardFull(newBoard)) {
          setGameOver(true);
          setMessage("Game over! It's a draw!");
          return true;
        }
        
        // Switch player
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        setMessage(`${currentPlayer === 'X' ? (gameMode === 1 ? "Player 2" : "AI") : (gameMode === 1 ? "Player 1" : "You")}'s turn (${currentPlayer === 'X' ? 'O' : 'X'})`);
        return true;
      }
    }
    
    return false;
  };

  // Check if board is full (draw)
  const isBoardFull = (board) => {
    return board[0].every(cell => cell !== ' ');
  };

  // Check if the last move resulted in a win
  const checkWin = (row, col, board) => {
    const piece = board[row][col];
    
    // Check directions: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
      [0, 1],  // horizontal
      [1, 0],  // vertical
      [1, 1],  // diagonal down-right
      [1, -1], // diagonal down-left
    ];
    
    for (const [dr, dc] of directions) {
      let count = 1;  // Start with 1 for the piece just placed
      
      // Check in the positive direction
      for (let i = 1; i <= 3; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === piece) {
          count++;
        } else {
          break;
        }
      }
      
      // Check in the negative direction
      for (let i = 1; i <= 3; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === piece) {
          count++;
        } else {
          break;
        }
      }
      
      // If we found 4 or more in a row, it's a win
      if (count >= 4) {
        return true;
      }
    }
    
    return false;
  };

  // AI Logic
  const aiMove = () => {
    if (gameOver) return;
    
    setAiThinking(true);
    
    // Use setTimeout to create a small delay for a better UX
    setTimeout(() => {
      const col = findBestMove();
      makeMove(col);
      setAiThinking(false);
    }, 700);
  };

  // AI move based on difficulty
  const findBestMove = () => {
    const validMoves = getValidMoves();
    if (validMoves.length === 0) return null;
    
    switch (difficulty) {
      case 'easy':
        return randomMove();
      case 'medium':
        return smartMove();
      case 'hard':
        return minimaxMove();
      default:
        return randomMove();
    }
  };

  // Random AI move
  const randomMove = () => {
    const validMoves = getValidMoves();
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  };

  // Smart AI move (looks for immediate wins or blocks)
  const smartMove = () => {
    const validMoves = getValidMoves();
    if (validMoves.length === 0) return null;
    
    // Check if AI can win in one move
    for (const col of validMoves) {
      const tempBoard = board.map(row => [...row]);
      
      // Simulate the move
      for (let row = ROWS - 1; row >= 0; row--) {
        if (tempBoard[row][col] === ' ') {
          tempBoard[row][col] = 'O';
          if (checkWin(row, col, tempBoard)) {
            return col;
          }
          break;
        }
      }
    }
    
    // Check if opponent can win in one move and block it
    for (const col of validMoves) {
      const tempBoard = board.map(row => [...row]);
      
      // Simulate the move
      for (let row = ROWS - 1; row >= 0; row--) {
        if (tempBoard[row][col] === ' ') {
          tempBoard[row][col] = 'X';
          if (checkWin(row, col, tempBoard)) {
            return col;
          }
          break;
        }
      }
    }
    
    // Play in the center column if possible
    const center = 3;
    if (validMoves.includes(center)) {
      return center;
    }
    
    // Otherwise, make a random move
    return randomMove();
  };

  // Minimax AI move (simplified for React performance)
  const minimaxMove = () => {
    const validMoves = getValidMoves();
    if (validMoves.length === 0) return null;
    
    let bestScore = -Infinity;
    let bestMove = validMoves[0];
    
    // Try each valid move
    for (const col of validMoves) {
      const tempBoard = board.map(row => [...row]);
      let row = -1;
      
      // Find row where piece will land
      for (let r = ROWS - 1; r >= 0; r--) {
        if (tempBoard[r][col] === ' ') {
          tempBoard[r][col] = 'O';
          row = r;
          break;
        }
      }
      
      if (row === -1) continue;
      
      // If it's an immediate win, choose it
      if (checkWin(row, col, tempBoard)) {
        return col;
      }
      
      // Calculate score for this move
      const score = evaluateBoard(tempBoard);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }
    
    return bestMove;
  };

  // Evaluate board position for minimax
  const evaluateBoard = (board) => {
    let score = 0;
    
    // Horizontal evaluation
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        const window = [board[row][col], board[row][col+1], board[row][col+2], board[row][col+3]];
        score += evaluateWindow(window);
      }
    }
    
    // Vertical evaluation
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row <= ROWS - 4; row++) {
        const window = [board[row][col], board[row+1][col], board[row+2][col], board[row+3][col]];
        score += evaluateWindow(window);
      }
    }
    
    // Diagonal (positive slope)
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        const window = [board[row][col], board[row+1][col+1], board[row+2][col+2], board[row+3][col+3]];
        score += evaluateWindow(window);
      }
    }
    
    // Diagonal (negative slope)
    for (let row = 3; row < ROWS; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        const window = [board[row][col], board[row-1][col+1], board[row-2][col+2], board[row-3][col+3]];
        score += evaluateWindow(window);
      }
    }
    
    // Center column bias
    const centerCol = Math.floor(COLS / 2);
    for (let row = 0; row < ROWS; row++) {
      if (board[row][centerCol] === 'O') {
        score += 3;
      }
    }
    
    return score;
  };

  // Evaluate a window of 4 cells
  const evaluateWindow = (window) => {
    const countO = window.filter(cell => cell === 'O').length;
    const countX = window.filter(cell => cell === 'X').length;
    const countEmpty = window.filter(cell => cell === ' ').length;
    
    // AI piece scoring
    if (countO === 4) return 100;
    if (countO === 3 && countEmpty === 1) return 5;
    if (countO === 2 && countEmpty === 2) return 2;
    
    // Opponent piece scoring (negative)
    if (countX === 4) return -100;
    if (countX === 3 && countEmpty === 1) return -10;
    
    return 0;
  };

  // Handle player's move when clicking a column
  const handleColumnClick = (col) => {
    if (gameOver || (gameMode === 2 && currentPlayer === 'O') || aiThinking) return;
    
    makeMove(col);
  };

  // AI makes a move after player's turn
  useEffect(() => {
    if (gameMode === 2 && currentPlayer === 'O' && !gameOver) {
      aiMove();
    }
  }, [currentPlayer, gameMode, gameOver]);

  // Render game board cell
  const renderCell = (row, col) => {
    const cellValue = board[row][col];
    let cellClass = "w-12 h-12 rounded-full m-1 ";
    
    if (cellValue === 'X') {
      cellClass += "bg-red-500";
    } else if (cellValue === 'O') {
      cellClass += "bg-yellow-500";
    } else {
      cellClass += "bg-white";
    }
    
    return <div key={`${row}-${col}`} className={cellClass}></div>;
  };

  // Render game board column
  const renderColumn = (col) => {
    return (
      <div
        key={col}
        className="flex flex-col-reverse items-center cursor-pointer hover:bg-blue-100"
        onClick={() => handleColumnClick(col)}
      >
        {Array.from({ length: ROWS }, (_, row) => renderCell(row, col))}
      </div>
    );
  };

  // Conditional rendering based on game state
  if (gameMode === null) {
    // Game mode selection screen
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">Connect Four</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Select Game Mode</h2>
          <div className="flex flex-col gap-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              onClick={() => startGame(1)}
            >
              Play against a friend
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
              onClick={() => setGameMode('ai-select')}
            >
              Play against AI
            </button>
          </div>
        </div>
      </div>
    );
  } else if (gameMode === 'ai-select') {
    // AI difficulty selection screen
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">Connect Four</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Select AI Difficulty</h2>
          <div className="flex flex-col gap-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
              onClick={() => selectDifficulty(1)}
            >
              Easy
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg"
              onClick={() => selectDifficulty(2)}
            >
              Medium
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
              onClick={() => selectDifficulty(3)}
            >
              Hard
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mt-4"
              onClick={() => setGameMode(null)}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main game board
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
      <h1 className="text-4xl font-bold text-blue-800 mb-4">Connect Four</h1>
      
      <div className="mb-4 text-xl font-semibold">
        {aiThinking ? "AI is thinking..." : message}
      </div>
      
      <div className="bg-blue-600 p-4 rounded-lg shadow-lg">
        <div className="flex">
          {Array.from({ length: COLS }, (_, col) => renderColumn(col))}
        </div>
      </div>
      
      <div className="mt-6 flex gap-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={resetGame}
        >
          New Game
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setGameMode(null)}
        >
          Change Mode
        </button>
      </div>
      
      {gameMode === 2 && (
        <div className="mt-4 text-gray-700">
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </div>
      )}
      
      {gameOver && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md text-xl font-bold">
          {winner ? `${winner === 'X' ? (gameMode === 1 ? "Player 1" : "You") : (gameMode === 1 ? "Player 2" : "AI")} (${winner}) wins!` : "It's a draw!"}
        </div>
      )}
    </div>
  );
};