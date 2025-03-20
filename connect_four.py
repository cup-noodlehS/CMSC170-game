#!/usr/bin/env python3

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

def main():
    """Run the Connect Four game."""
    game = ConnectFour()
    
    print("Welcome to Connect Four!")
    print("Players take turns dropping pieces into columns.")
    print("The first player to connect 4 pieces horizontally, vertically, or diagonally wins!")
    print("Player 1: X, Player 2: O")
    print()
    
    while not game.game_over:
        game.print_board()
        player_name = "Player 1" if game.current_player == 'X' else "Player 2"
        
        try:
            col = int(input(f"{player_name}'s turn ({game.current_player}). Choose column (1-7): ")) - 1
            if not game.make_move(col):
                print("Invalid move! Try again.")
        except ValueError:
            print("Please enter a number between 1 and 7.")
    
    # Game is over, show final board and result
    game.print_board()
    
    if game.winner:
        winner_name = "Player 1" if game.winner == 'X' else "Player 2"
        print(f"Game over! {winner_name} ({game.winner}) wins!")
    else:
        print("Game over! It's a draw!")

if __name__ == "__main__":
    main()
