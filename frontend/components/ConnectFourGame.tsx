'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

type GameMode = 1 | 2 | 'ai-select' | null;
type Player = 'X' | 'O' | ' ';
type DifficultyLevel = 'easy' | 'medium' | 'hard';
type Board = Player[][];

// Theme colors
const COLORS = {
  background: 'bg-gradient-to-b from-blue-500 to-blue-700',
  primary: 'bg-blue-600',
  primaryHover: 'hover:bg-blue-700',
  secondary: 'bg-purple-600',
  secondaryHover: 'hover:bg-purple-700',
  success: 'bg-green-600',
  successHover: 'hover:bg-green-700',
  warning: 'bg-yellow-500',
  warningHover: 'hover:bg-yellow-600',
  danger: 'bg-red-500',
  dangerHover: 'hover:bg-red-600',
  neutral: 'bg-gray-600',
  neutralHover: 'hover:bg-gray-700',
  playerX: 'bg-red-500',
  playerO: 'bg-yellow-500',
  empty: 'bg-white',
  text: 'text-white',
  textDark: 'text-gray-800',
};

export default function ConnectFourGame () {
  const ROWS = 6;
  const COLS = 7;
  
  // Game state
  const [board, setBoard] = useState<Board>(Array(ROWS).fill(null).map(() => Array(COLS).fill(' ')));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  
  // UI state
  const [message, setMessage] = useState<string>("Welcome to Connect Four!");
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [dropAnimationCol, setDropAnimationCol] = useState<number | null>(null);
  const [highlightWinCells, setHighlightWinCells] = useState<{row: number, col: number}[]>([]);

  // Reset the game - memoize with useCallback to prevent unnecessary rerenders
  const resetGame = useCallback(() => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(' ')));
    setCurrentPlayer('X');
    setGameOver(false);
    setWinner(null);
    setHighlightWinCells([]);
    setMessage(gameMode === 1 ? "Player 1's turn" : "Your turn");
  }, [gameMode]);

  // Initialize game based on selected mode
  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
    setMessage(mode === 1 ? "Player 1's turn" : "Your turn");
  };

  // Select AI difficulty
  const selectDifficulty = (level: 1 | 2 | 3) => {
    const difficultyLevels: Record<number, DifficultyLevel> = {1: 'easy', 2: 'medium', 3: 'hard'};
    setDifficulty(difficultyLevels[level]);
    startGame(2);
  };

  // Check if move is valid
  const isValidMove = (col: number): boolean => {
    if (col < 0 || col >= COLS) return false;
    return board[0][col] === ' ';
  };

  // Get all valid moves
  const getValidMoves = (): number[] => {
    return Array.from({length: COLS}, (_, i) => i).filter(col => isValidMove(col));
  };

  // Make a move
  const makeMove = (col: number): boolean => {
    if (!isValidMove(col) || gameOver) return false;
    
    const newBoard = board.map(row => [...row]);
    
    // Find the lowest empty row in the column
    let landedRow = -1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === ' ') {
        newBoard[row][col] = currentPlayer;
        landedRow = row;
        // Trigger drop animation
        setDropAnimationCol(col);
        break;
      }
    }
    
    if (landedRow === -1) return false;
    
    setBoard(newBoard);
    
    // Check for win
    const winningCells = getWinningCells(landedRow, col, newBoard);
    if (winningCells.length > 0) {
      setGameOver(true);
      setWinner(currentPlayer);
      setHighlightWinCells(winningCells);
      setMessage(`Game over! ${currentPlayer === 'X' ? (gameMode === 1 ? "Player 1" : "You") : (gameMode === 1 ? "Player 2" : "AI")} wins!`);
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
    setMessage(`${currentPlayer === 'X' ? (gameMode === 1 ? "Player 2's" : "AI's") : (gameMode === 1 ? "Player 1's" : "Your")} turn`);
    
    // Reset animation flag after a short delay
    setTimeout(() => {
      setDropAnimationCol(null);
    }, 500);
    
    return true;
  };

  // Check if board is full (draw)
  const isBoardFull = (board: Board): boolean => {
    return board[0].every(cell => cell !== ' ');
  };

  // Get cells that form a winning line
  const getWinningCells = (row: number, col: number, board: Board): {row: number, col: number}[] => {
    const piece = board[row][col];
    
    // Check directions: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
      [0, 1],  // horizontal
      [1, 0],  // vertical
      [1, 1],  // diagonal down-right
      [1, -1], // diagonal down-left
    ];
    
    for (const [dr, dc] of directions) {
      const cellsInLine: {row: number, col: number}[] = [{row, col}];
      let count = 1;  // Start with 1 for the piece just placed
      
      // Check in the positive direction
      for (let i = 1; i <= 3; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === piece) {
          count++;
          cellsInLine.push({row: r, col: c});
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
          cellsInLine.push({row: r, col: c});
        } else {
          break;
        }
      }
      
      // If we found 4 or more in a row, it's a win
      if (count >= 4) {
        return cellsInLine;
      }
    }
    
    return [];
  };

  // Check if the last move resulted in a win (simplified version used by AI)
  const checkWin = (row: number, col: number, board: Board): boolean => {
    return getWinningCells(row, col, board).length > 0;
  };

  // AI Logic
  const aiMove = () => {
    if (gameOver) return;
    
    setAiThinking(true);
    
    // Use setTimeout to create a small delay for a better UX
    setTimeout(() => {
      const col = findBestMove();
      if (col !== null) {
        makeMove(col);
      }
      setAiThinking(false);
    }, 700);
  };

  // AI move based on difficulty
  const findBestMove = (): number | null => {
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
  const randomMove = (): number | null => {
    const validMoves = getValidMoves();
    if (validMoves.length === 0) return null;
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  };

  // Smart AI move (looks for immediate wins or blocks)
  const smartMove = (): number | null => {
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
  const minimaxMove = (): number | null => {
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
  const evaluateBoard = (board: Board): number => {
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
  const evaluateWindow = (window: Player[]): number => {
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
  const handleColumnClick = (col: number): void => {
    if (gameOver || (gameMode === 2 && currentPlayer === 'O') || aiThinking) return;
    
    makeMove(col);
  };

  // AI makes a move after player's turn
  useEffect(() => {
    if (gameMode === 2 && currentPlayer === 'O' && !gameOver) {
      aiMove();
    }
  }, [currentPlayer, gameMode, gameOver]);

  // Check if a cell is part of the winning combination
  const isWinningCell = (row: number, col: number): boolean => {
    return highlightWinCells.some(cell => cell.row === row && cell.col === col);
  };

  // Render game board cell
  const renderCell = (row: number, col: number) => {
    const cellValue = board[row][col];
    const isWinning = isWinningCell(row, col);
    const isAnimating = dropAnimationCol === col && cellValue !== ' ';
    
    let cellClassName = "w-14 h-14 rounded-full m-1 shadow-inner transition-all duration-300 ";
    
    // Add base color based on cell value
    if (cellValue === 'X') {
      cellClassName += COLORS.playerX;
    } else if (cellValue === 'O') {
      cellClassName += COLORS.playerO;
    } else {
      cellClassName += COLORS.empty;
    }
    
    // Add winning animation if this is part of the winning combination
    if (isWinning) {
      cellClassName += " animate-pulse ring-4 ring-white";
    }
    
    return (
      <motion.div 
        key={`${row}-${col}`} 
        className={cellClassName}
        initial={isAnimating ? { y: -row * 56 - 80 } : false}
        animate={isAnimating ? { y: 0 } : {}}
        transition={isAnimating ? { 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          duration: 0.5
        } : {}}
      />
    );
  };

  // Render game board column with hover effects
  const renderColumn = (col: number) => {
    // Only show hover indicator if the game is active and it's a valid move
    const showHoverIndicator = !gameOver && 
                              !(gameMode === 2 && currentPlayer === 'O') && 
                              !aiThinking && 
                              isValidMove(col);
    
    return (
      <div
        key={col}
        className="relative flex flex-col items-center cursor-pointer group"
        onClick={() => handleColumnClick(col)}
      >
        {/* Hover indicator at the top of the column */}
        {showHoverIndicator && (
          <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className={`w-10 h-10 rounded-full mb-1 ${currentPlayer === 'X' ? COLORS.playerX : COLORS.playerO}`}></div>
          </div>
        )}
        
        {/* Column background with hover effect */}
        <div className="absolute inset-0 w-full h-full bg-blue-700 opacity-0 group-hover:opacity-20 transition-opacity"></div>
        
        {/* Column cells */}
        <div className="z-10">
          {Array.from({ length: ROWS }, (_, i) => renderCell(i, col))}
        </div>
      </div>
    );
  };

  // Conditional rendering based on game state
  if (gameMode === null) {
    // Game mode selection screen
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${COLORS.background} p-6`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg text-center">Connect Four</h1>
          <p className="text-blue-100 text-center mb-10">The classic game of strategy and skill</p>
        </motion.div>
        
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Select Game Mode</h2>
          
          <div className="flex flex-col gap-4">
            <motion.button
              className={`${COLORS.primary} ${COLORS.primaryHover} ${COLORS.text} cursor-pointer font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-all shadow-md`}
              onClick={() => startGame(1)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Play against a friend
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </motion.button>
            
            <motion.button
              className={`${COLORS.secondary} ${COLORS.secondaryHover} ${COLORS.text} cursor-pointer font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-all shadow-md`}
              onClick={() => setGameMode('ai-select')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Play against AI
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  } else if (gameMode === 'ai-select') {
    // AI difficulty selection screen
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${COLORS.background} p-6`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg text-center">Connect Four</h1>
          <p className="text-blue-100 text-center mb-8">Choose your opponent&apos;s skill level</p>
        </motion.div>
        
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Select AI Difficulty</h2>
          
          <div className="flex flex-col gap-5">
            <motion.button
              className="bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between shadow-md"
              onClick={() => selectDifficulty(1)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Easy
              </span>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Beginner</span>
            </motion.button>
            
            <motion.button
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between shadow-md"
              onClick={() => selectDifficulty(2)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Medium
              </span>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Intermediate</span>
            </motion.button>
            
            <motion.button
              className="bg-gradient-to-r from-red-400 to-red-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between shadow-md"
              onClick={() => selectDifficulty(3)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
                Hard
              </span>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Advanced</span>
            </motion.button>
            
            <motion.button
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg mt-4 flex items-center justify-center gap-2 shadow-md"
              onClick={() => setGameMode(null)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main game board
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${COLORS.background} p-4`}>
      {/* Instructions Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowInstructions(true)}
          className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-white flex items-center justify-center transition-all"
          aria-label="Show instructions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-2xl w-full relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close instructions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">How to Play Connect Four</h2>
            
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Objective</h3>
                <p>Be the first player to connect four of your colored checkers in a row, either horizontally, vertically, or diagonally.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Game Rules</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Players take turns dropping their colored checkers into one of the seven columns.</li>
                  <li>The checker will fall to the lowest available position in the chosen column.</li>
                  <li>The game ends when either:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>A player connects four checkers in a row (horizontally, vertically, or diagonally)</li>
                      <li>All positions are filled (resulting in a draw)</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">How to Play</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Click on any column to drop your checker</li>
                  <li>Hover over a column to preview where your checker will fall</li>
                  <li>Plan your moves to both create your own connections and block your opponent</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Game Modes</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><span className="font-medium">Player vs Player:</span> Play against a friend on the same device</li>
                  <li><span className="font-medium">Player vs AI:</span> Challenge the computer with three difficulty levels:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Easy - For beginners</li>
                      <li>Medium - For casual players</li>
                      <li>Hard - For experienced players</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <header className="w-full max-w-4xl text-center mb-6">
        <motion.h1 
          className="text-4xl font-bold text-white mb-2 drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Connect Four
        </motion.h1>
        
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-full py-2 px-4 inline-block text-xl font-medium text-white mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {aiThinking ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              AI is thinking...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {!gameOver && (
                <div className={`w-6 h-6 rounded-full ${currentPlayer === 'X' ? COLORS.playerX : COLORS.playerO}`}></div>
              )}
              {message}
            </div>
          )}
        </motion.div>
      </header>
      
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Display whose turn it is above the board if game is not over */}
        {!gameOver && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="px-4 py-1 bg-white/10 backdrop-blur-sm rounded-t-xl text-sm text-white">
              {currentPlayer === 'X' ? 
                (gameMode === 1 ? "Player 1's Turn" : "Your Turn") : 
                (gameMode === 1 ? "Player 2's Turn" : "AI's Turn")}
            </div>
          </div>
        )}
        
        {/* Game board with drop area */}
        <div className="relative">
          <div className="bg-blue-800 p-3 rounded-xl shadow-lg border-4 border-blue-900">
            {/* Drop area - only visible when game is active */}
            {!gameOver && (
              <div className="h-16 flex mb-1">
                {Array.from({ length: COLS }, (_, col) => (
                  <div key={`drop-${col}`} className="w-16 flex justify-center items-center">
                    {isValidMove(col) && (
                      <motion.div 
                        className={`w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 
                                  ${currentPlayer === 'X' ? COLORS.playerX : COLORS.playerO}`}
                        initial={false}
                        whileHover={{ opacity: 0.5, y: [0, -5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Main board grid */}
            <div className="flex bg-blue-700 rounded-lg p-1">
              {Array.from({ length: COLS }, (_, col) => renderColumn(col))}
            </div>
          </div>
          
          {/* Left stand */}
          <div className="absolute -bottom-4 -left-6 w-10 h-14 bg-blue-800 border-4 border-blue-900 rounded-lg"></div>
          
          {/* Right stand */}
          <div className="absolute -bottom-4 -right-6 w-10 h-14 bg-blue-800 border-4 border-blue-900 rounded-lg"></div>
        </div>
        
        {/* Game controls */}
        <div className="mt-8 flex gap-4 justify-center">
          <motion.button
            className={`${COLORS.success} ${COLORS.successHover} cursor-pointer text-white font-bold py-3 px-5 rounded-lg shadow-md flex items-center gap-2`}
            onClick={resetGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Game
          </motion.button>
          
          <motion.button
            className={`${COLORS.neutral} ${COLORS.neutralHover} cursor-pointer text-white font-bold py-3 px-5 rounded-lg shadow-md flex items-center gap-2`}
            onClick={() => setGameMode(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Change Mode
          </motion.button>
        </div>
        
        {/* Difficulty indicator for AI games */}
        {gameMode === 2 && (
          <div className="mt-4 text-blue-100 text-sm flex justify-center items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Difficulty: <span className="font-semibold">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
          </div>
        )}
      </motion.div>
      
      {/* Win/Draw notification */}
      {gameOver && (
        <motion.div 
          className="mt-8 p-5 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl text-xl font-bold text-gray-800 flex flex-col items-center"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {winner ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full ${winner === 'X' ? COLORS.playerX : COLORS.playerO}`}></div>
                <span>{winner === 'X' ? (gameMode === 1 ? "Player 1" : "You") : (gameMode === 1 ? "Player 2" : "AI")} wins!</span>
              </div>
              <div className="text-sm text-gray-600">Click &quot;New Game&quot; to play again</div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                </svg>
                <span>It&apos;s a draw!</span>
              </div>
              <div className="text-sm text-gray-600">Click &quot;New Game&quot; to play again</div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}