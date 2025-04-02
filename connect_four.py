#!/usr/bin/env python3
import random

class ConnectFour:
    def __init__(self):
        self.rows = 6
        self.cols = 7
        self.board = [[' ' for _ in range(self.cols)] for _ in range(self.rows)]
        self.current_player = 'X'
        self.game_over = False
        self.winner = None
    
    def print_board(self):
        """Print the current state of the board."""
        # Print column numbers
        print(' ' + ' '.join(str(i) for i in range(1, self.cols + 1)))
        
        # Print board with pieces
        for row in self.board:
            print('|' + '|'.join(row) + '|')
        
        # Print bottom border
        print('+' + '-' * (2 * self.cols - 1) + '+')
    
    def is_valid_move(self, col):
        """Check if the column is valid for a new piece."""
        # Check if column is in range
        if col < 0 or col >= self.cols:
            return False
        
        # Check if column is full
        return self.board[0][col] == ' '
    
    def make_move(self, col):
        """Drop a piece in the specified column."""
        if not self.is_valid_move(col) or self.game_over:
            return False
        
        # Find the lowest empty row in the column
        for row in range(self.rows - 1, -1, -1):
            if self.board[row][col] == ' ':
                self.board[row][col] = self.current_player
                self.check_win(row, col)
                self.current_player = 'O' if self.current_player == 'X' else 'X'
                return True
        
        return False
    
    def check_win(self, row, col):
        """Check if the last move resulted in a win."""
        piece = self.board[row][col]
        
        # Check horizontal
        self._check_line(row, 0, 0, 1, piece)
        
        # Check vertical
        self._check_line(0, col, 1, 0, piece)
        
        # Check diagonal (top-left to bottom-right)
        self._check_line(max(0, row - min(row, col)), max(0, col - min(row, col)), 1, 1, piece)
        
        # Check diagonal (top-right to bottom-left)
        start_row = max(0, row - min(row, self.cols - 1 - col))
        start_col = min(self.cols - 1, col + row - start_row)
        self._check_line(start_row, start_col, 1, -1, piece)
        
        # Check if board is full (draw)
        if not self.game_over and all(self.board[0][c] != ' ' for c in range(self.cols)):
            self.game_over = True
    
    def _check_line(self, start_row, start_col, row_step, col_step, piece):
        """Helper method to check for 4 in a row in a line."""
        if self.game_over:
            return
        
        count = 0
        row, col = start_row, start_col
        
        while 0 <= row < self.rows and 0 <= col < self.cols:
            if self.board[row][col] == piece:
                count += 1
                if count == 4:
                    self.game_over = True
                    self.winner = piece
                    return
            else:
                count = 0
            
            row += row_step
            col += col_step
    
    def get_valid_moves(self):
        """Return a list of valid column moves."""
        return [col for col in range(self.cols) if self.is_valid_move(col)]
    
    def get_board_copy(self):
        """Return a copy of the current board."""
        return [row[:] for row in self.board]


class ConnectFourAI:
    def __init__(self, piece, difficulty='medium'):
        """Initialize AI with a piece ('X' or 'O') and difficulty level."""
        self.piece = piece
        self.opponent_piece = 'X' if piece == 'O' else 'O'
        self.difficulty = difficulty
    
    def make_move(self, game):
        """Determine the best move based on the current game state."""
        if self.difficulty == 'easy':
            return self.random_move(game)
        elif self.difficulty == 'medium':
            return self.smart_move(game)
        else:  # hard
            return self.minimax_move(game)
    
    def random_move(self, game):
        """Make a random valid move."""
        valid_moves = game.get_valid_moves()
        return random.choice(valid_moves) if valid_moves else None
    
    def smart_move(self, game):
        """Make a smarter move by checking for wins or blocks."""
        valid_moves = game.get_valid_moves()
        if not valid_moves:
            return None
        
        # Check if AI can win in one move
        for col in valid_moves:
            temp_game = ConnectFour()
            temp_game.board = game.get_board_copy()
            temp_game.current_player = self.piece
            if temp_game.make_move(col) and temp_game.winner == self.piece:
                return col
        
        # Check if opponent can win in one move and block it
        for col in valid_moves:
            temp_game = ConnectFour()
            temp_game.board = game.get_board_copy()
            temp_game.current_player = self.opponent_piece
            if temp_game.make_move(col) and temp_game.winner == self.opponent_piece:
                return col
        
        # Play in the center column if possible
        center = 3
        if center in valid_moves:
            return center
        
        # Otherwise, make a random move
        return random.choice(valid_moves)
    
    def minimax_move(self, game):
        """Use minimax algorithm to find the best move (simplified version)."""
        # For now, we'll use the smart move as a placeholder
        # Implementing a full minimax with alpha-beta pruning would be more complex
        return self.smart_move(game)


def main():
    """Run the Connect Four game."""
    print("Welcome to Connect Four!")
    print("1. Play against a friend")
    print("2. Play against AI")
    
    while True:
        try:
            game_mode = int(input("Select mode (1 or 2): "))
            if game_mode in [1, 2]:
                break
            else:
                print("Please enter 1 or 2.")
        except ValueError:
            print("Please enter a number.")
    
    ai = None
    if game_mode == 2:
        print("\nSelect AI difficulty:")
        print("1. Easy")
        print("2. Medium")
        print("3. Hard")
        
        while True:
            try:
                difficulty = int(input("Select difficulty (1-3): "))
                if 1 <= difficulty <= 3:
                    difficulty_levels = {1: 'easy', 2: 'medium', 3: 'hard'}
                    ai_piece = 'O'  # AI will be player 2
                    ai = ConnectFourAI(ai_piece, difficulty_levels[difficulty])
                    break
                else:
                    print("Please enter a number between 1 and 3.")
            except ValueError:
                print("Please enter a number.")
    
    game = ConnectFour()
    
    print("\nGame started!")
    print("Players take turns dropping pieces into columns.")
    print("The first player to connect 4 pieces horizontally, vertically, or diagonally wins!")
    if game_mode == 1:
        print("Player 1: X, Player 2: O")
    else:
        print("You: X, AI: O")
    print()
    
    while not game.game_over:
        game.print_board()
        
        if game_mode == 2 and game.current_player == ai.piece:
            # AI's turn
            print(f"AI is thinking...")
            col = ai.make_move(game)
            print(f"AI chooses column {col + 1}")
            game.make_move(col)
        else:
            # Human player's turn
            player_name = "Player 1" if game.current_player == 'X' else "Player 2"
            if game_mode == 2:
                player_name = "You" if game.current_player == 'X' else "AI"
            
            try:
                col = int(input(f"{player_name}'s turn ({game.current_player}). Choose column (1-7): ")) - 1
                if not game.make_move(col):
                    print("Invalid move! Try again.")
            except ValueError:
                print("Please enter a number between 1 and 7.")
    
    # Game is over, show final board and result
    game.print_board()
    
    if game.winner:
        if game_mode == 1:
            winner_name = "Player 1" if game.winner == 'X' else "Player 2"
        else:
            winner_name = "You" if game.winner == 'X' else "AI"
        print(f"Game over! {winner_name} ({game.winner}) wins!")
    else:
        print("Game over! It's a draw!")

if __name__ == "__main__":
    main()
