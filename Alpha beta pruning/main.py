import os
import time
import random
from colorama import Fore, Back, Style, init

# Initialize colorama
init(autoreset=True)

class TicTacToe:
    def __init__(self, max_depth=9):
        self.board = [' ' for _ in range(9)]
        self.current_player = 'X'  # Human player
        self.ai_player = 'O'       # AI player
        self.max_depth = max_depth
        self.total_nodes = 0
        self.pruned_nodes = 0
        self.tree_representation = []
        self.step_mode = False
        self.show_hints = True

    def reset_game(self):
        self.board = [' ' for _ in range(9)]
        self.current_player = 'X'
        self.total_nodes = 0
        self.pruned_nodes = 0
        self.tree_representation = []

    def print_board(self):
        """Print the current game board"""
        os.system('cls' if os.name == 'nt' else 'clear')
        print("\n" + Fore.CYAN + "TIC-TAC-TOE with Alpha-Beta Pruning" + Style.RESET_ALL)
        print(Fore.YELLOW + "You: X  |  AI: O\n" + Style.RESET_ALL)
        
        for i in range(0, 9, 3):
            row = " "
            for j in range(3):
                cell = self.board[i + j]
                if cell == 'X':
                    row += Fore.GREEN + cell + Style.RESET_ALL
                elif cell == 'O':
                    row += Fore.RED + cell + Style.RESET_ALL
                else:
                    row += str(i + j + 1)
                
                if j < 2:
                    row += " | "
            
            print(row)
            if i < 6:
                print("-----------")
        
        print("\n")

    def is_winner(self, board, player):
        """Check if the specified player has won"""
        win_states = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # columns
            [0, 4, 8], [2, 4, 6]              # diagonals
        ]
        
        for state in win_states:
            if all(board[i] == player for i in state):
                return True
        return False

    def is_board_full(self, board):
        """Check if the board is full"""
        return ' ' not in board

    def get_available_moves(self, board):
        """Get all empty positions on the board"""
        return [i for i, spot in enumerate(board) if spot == ' ']

    def make_move(self, board, position, player):
        """Make a move on the board"""
        new_board = board.copy()
        new_board[position] = player
        return new_board

    def minimax_alpha_beta(self, board, depth, alpha, beta, maximizing_player, node_id="0", parent_id=None):
        """Minimax algorithm with alpha-beta pruning"""
        self.total_nodes += 1
        
        # Create node for visualization
        node = {
            'id': node_id,
            'parent_id': parent_id,
            'board': board.copy(),
            'depth': depth,
            'alpha': alpha,
            'beta': beta,
            'value': None,
            'pruned': False,
            'best_move': None
        }
        
        # Terminal conditions
        if self.is_winner(board, self.ai_player):
            node['value'] = 10 - depth  # Win is better if it happens sooner
            self.tree_representation.append(node)
            return node['value'], -1, node['id']
        
        if self.is_winner(board, 'X'):
            node['value'] = depth - 10  # Loss is better if it happens later
            self.tree_representation.append(node)
            return node['value'], -1, node['id']
        
        if self.is_board_full(board) or depth >= self.max_depth:
            node['value'] = 0  # Draw
            self.tree_representation.append(node)
            return node['value'], -1, node['id']
        
        available_moves = self.get_available_moves(board)
        best_move = -1
        
        # For step mode, show the current node being evaluated
        if self.step_mode:
            self.visualize_board_state(board, depth, alpha, beta, node_id)
        
        # Maximizing player (AI)
        if maximizing_player:
            best_val = float('-inf')
            for i, move in enumerate(available_moves):
                child_id = f"{node_id}-{i}"
                
                new_board = self.make_move(board, move, self.ai_player)
                val, _, child_node_id = self.minimax_alpha_beta(new_board, depth + 1, alpha, beta, False, child_id, node_id)
                
                if val > best_val:
                    best_val = val
                    best_move = move
                
                alpha = max(alpha, best_val)
                
                # Alpha-beta pruning
                if beta <= alpha:
                    self.pruned_nodes += 1
                    # Mark remaining moves as pruned
                    for j in range(i + 1, len(available_moves)):
                        pruned_id = f"{node_id}-{j}"
                        pruned_node = {
                            'id': pruned_id,
                            'parent_id': node_id,
                            'board': self.make_move(board, available_moves[j], self.ai_player),
                            'depth': depth + 1,
                            'alpha': alpha,
                            'beta': beta,
                            'value': None,
                            'pruned': True,
                            'best_move': None
                        }
                        self.tree_representation.append(pruned_node)
                    break
            
            node['value'] = best_val
            node['best_move'] = best_move
            self.tree_representation.append(node)
            return best_val, best_move, node['id']
        
        # Minimizing player (Human)
        else:
            best_val = float('inf')
            for i, move in enumerate(available_moves):
                child_id = f"{node_id}-{i}"
                
                new_board = self.make_move(board, move, 'X')
                val, _, child_node_id = self.minimax_alpha_beta(new_board, depth + 1, alpha, beta, True, child_id, node_id)
                
                if val < best_val:
                    best_val = val
                    best_move = move
                
                beta = min(beta, best_val)
                
                # Alpha-beta pruning
                if beta <= alpha:
                    self.pruned_nodes += 1
                    # Mark remaining moves as pruned
                    for j in range(i + 1, len(available_moves)):
                        pruned_id = f"{node_id}-{j}"
                        pruned_node = {
                            'id': pruned_id,
                            'parent_id': node_id,
                            'board': self.make_move(board, available_moves[j], 'X'),
                            'depth': depth + 1,
                            'alpha': alpha,
                            'beta': beta,
                            'value': None,
                            'pruned': True,
                            'best_move': None
                        }
                        self.tree_representation.append(pruned_node)
                    break
            
            node['value'] = best_val
            node['best_move'] = best_move
            self.tree_representation.append(node)
            return best_val, best_move, node['id']

    def visualize_board_state(self, board, depth, alpha, beta, node_id):
        """Visualize the current board state being evaluated in step mode"""
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"\n{Fore.CYAN}Alpha-Beta Pruning Step Visualization{Style.RESET_ALL}")
        print(f"Depth: {depth} | Node: {node_id}")
        print(f"Alpha: {alpha} | Beta: {beta}")
        
        # Print the board state
        print("\nEvaluating board state:")
        for i in range(0, 9, 3):
            row = " "
            for j in range(3):
                cell = board[i + j]
                if cell == 'X':
                    row += Fore.GREEN + cell + Style.RESET_ALL
                elif cell == 'O':
                    row += Fore.RED + cell + Style.RESET_ALL
                else:
                    row += " "
                
                if j < 2:
                    row += " | "
            
            print(row)
            if i < 6:
                print("-----------")
        
        # Wait for user to press Enter to continue
        input("\nPress Enter to continue...")

    def visualize_decision_tree(self):
        """Print a simplified version of the decision tree"""
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"\n{Fore.CYAN}Decision Tree Visualization{Style.RESET_ALL}")
        
        # Display statistics
        efficiency = (self.pruned_nodes / max(1, self.total_nodes)) * 100
        print(f"Total nodes evaluated: {self.total_nodes}")
        print(f"Nodes pruned: {self.pruned_nodes} ({efficiency:.2f}%)")
        
        # Sort nodes by depth for easier visualization
        sorted_nodes = sorted(self.tree_representation, key=lambda x: (len(x['id'].split('-')), x['id']))
        
        # Select a subset of important nodes to display
        max_display = 20
        if len(sorted_nodes) > max_display:
            print(f"\nShowing {max_display} of {len(sorted_nodes)} nodes (focus on important decision points)")
            
            # Always include the root node
            important_nodes = [sorted_nodes[0]]
            
            # Add some representative nodes from each depth
            depths = set(node['depth'] for node in sorted_nodes)
            for depth in depths:
                depth_nodes = [n for n in sorted_nodes if n['depth'] == depth and not n['pruned']]
                if depth_nodes:
                    # Take a sample of nodes at this depth
                    sample_size = max(1, min(3, len(depth_nodes)))
                    important_nodes.extend(random.sample(depth_nodes, sample_size))
            
            # Add some pruned nodes as examples
            pruned_nodes = [n for n in sorted_nodes if n['pruned']]
            if pruned_nodes:
                sample_size = max(1, min(3, len(pruned_nodes)))
                important_nodes.extend(random.sample(pruned_nodes, sample_size))
            
            # Limit to max_display
            if len(important_nodes) > max_display:
                important_nodes = important_nodes[:max_display]
            
            display_nodes = important_nodes
        else:
            display_nodes = sorted_nodes
        
        # Print node information
        for i, node in enumerate(display_nodes):
            if node['pruned']:
                print(f"\n{Fore.RED}Node {node['id']} (PRUNED){Style.RESET_ALL}")
            else:
                print(f"\n{Fore.YELLOW}Node {node['id']}{Style.RESET_ALL}")
            
            if node['parent_id'] is not None:
                print(f"Parent: {node['parent_id']}")
            
            print(f"Depth: {node['depth']}")
            print(f"Alpha: {node['alpha']}, Beta: {node['beta']}")
            
            if node['value'] is not None:
                print(f"Value: {node['value']}")
            
            if node['best_move'] is not None:
                print(f"Best move: {node['best_move'] + 1}")
            
            # Print the board state
            for i in range(0, 9, 3):
                row = " "
                for j in range(3):
                    cell = node['board'][i + j]
                    if cell == 'X':
                        row += Fore.GREEN + cell + Style.RESET_ALL
                    elif cell == 'O':
                        row += Fore.RED + cell + Style.RESET_ALL
                    else:
                        row += " "
                    
                    if j < 2:
                        row += " | "
                
                print(row)
                if i < 6:
                    print("-----------")
        
        input("\nPress Enter to continue...")

    def ai_move(self):
        """Make the AI move using minimax with alpha-beta pruning"""
        self.tree_representation = []  # Reset tree for new visualization
        self.total_nodes = 0
        self.pruned_nodes = 0
        
        _, best_move, _ = self.minimax_alpha_beta(self.board, 0, float('-inf'), float('inf'), True)
        
        if best_move != -1:
            self.board[best_move] = self.ai_player
            
            if self.show_hints:
                print(f"{Fore.YELLOW}AI chose position {best_move + 1}{Style.RESET_ALL}")
                print(f"Evaluated {self.total_nodes} nodes, pruned {self.pruned_nodes} nodes")
                time.sleep(1.5)
        
        return best_move

    def play_game(self):
        """Main game loop"""
        while True:
            self.reset_game()
            
            # Game settings
            print(f"{Fore.CYAN}GAME SETTINGS{Style.RESET_ALL}")
            print("1. Max search depth (1-9, higher = stronger AI but slower): ")
            try:
                depth = int(input())
                self.max_depth = max(1, min(9, depth))
            except:
                self.max_depth = 9
            
            print("2. Step mode (see evaluations step by step)? (y/n): ")
            self.step_mode = input().lower().startswith('y')
            
            print("3. Show AI hints? (y/n): ")
            self.show_hints = input().lower().startswith('y')
            
            game_over = False
            
            # Decide who goes first
            print("\nWould you like to go first? (y/n): ")
            human_first = input().lower().startswith('y')
            
            if not human_first:
                self.current_player = self.ai_player
            
            # Main game loop
            while not game_over:
                self.print_board()
                
                if self.current_player == 'X':  # Human player
                    valid_move = False
                    while not valid_move:
                        try:
                            print("Enter your move (1-9): ")
                            move = int(input()) - 1
                            
                            if move < 0 or move > 8:
                                print("Please enter a number between 1 and 9.")
                                continue
                            
                            if self.board[move] != ' ':
                                print("That position is already taken!")
                                continue
                            
                            self.board[move] = 'X'
                            valid_move = True
                        except ValueError:
                            print("Please enter a valid number.")
                        except:
                            print("An error occurred. Try again.")
                else:  # AI player
                    print(f"{Fore.YELLOW}AI is thinking...{Style.RESET_ALL}")
                    self.ai_move()
                
                # Check for win or draw
                if self.is_winner(self.board, 'X'):
                    self.print_board()
                    print(f"{Fore.GREEN}Congratulations! You win!{Style.RESET_ALL}")
                    game_over = True
                elif self.is_winner(self.board, 'O'):
                    self.print_board()
                    print(f"{Fore.RED}AI wins! Better luck next time.{Style.RESET_ALL}")
                    game_over = True
                elif self.is_board_full(self.board):
                    self.print_board()
                    print(f"{Fore.BLUE}It's a draw!{Style.RESET_ALL}")
                    game_over = True
                
                # Switch players
                self.current_player = 'O' if self.current_player == 'X' else 'X'
            
            # Show decision tree visualization
            print("\nWould you like to see the decision tree? (y/n): ")
            show_tree = input().lower().startswith('y')
            
            if show_tree:
                self.visualize_decision_tree()
            
            # Play again?
            print("\nPlay again? (y/n): ")
            play_again = input().lower().startswith('y')
            
            if not play_again:
                break

if __name__ == "__main__":
    game = TicTacToe()
    game.play_game()
