# Tic-Tac-Toe with Alpha-Beta Pruning Visualization

A terminal-based Tic-Tac-Toe game that demonstrates the alpha-beta pruning algorithm with interactive visualizations.

## Features

- Play Tic-Tac-Toe against an AI opponent
- Adjustable AI difficulty (search depth)
- Step-by-step visualization of the alpha-beta pruning process
- Decision tree visualization after the game
- Statistics on pruned nodes vs. total evaluated nodes

## Installation

1. Make sure you have Python 3.6+ installed
2. Clone this repository
3. Install required dependencies:
   ```
   pip install -r requirements.txt
   ```

## How to Play

Run the game with:
```
python main.py
```

### Game Settings

Before playing, you can configure:
1. Max search depth (1-9): Higher values make the AI stronger but slower
2. Step mode: See the AI's evaluation process step by step
3. Show AI hints: Display information about the AI's moves and statistics

### Gameplay

- You play as 'X', the AI plays as 'O'
- Enter a number between 1-9 to place your mark at that position:
  ```
   1 | 2 | 3
  -----------
   4 | 5 | 6
  -----------
   7 | 8 | 9
  ```

### Decision Tree Visualization

After each game, you can view a simplified visualization of the decision tree, showing:
- Total nodes evaluated
- Nodes pruned by alpha-beta pruning
- Alpha and beta values at each node
- Board states at different points in the tree
- Pruned branches marked in red

## Understanding Alpha-Beta Pruning

Alpha-beta pruning is an optimization technique for the minimax algorithm:
- Alpha: The best value that the maximizing player (AI) is assured of
- Beta: The best value that the minimizing player (human) is assured of

When a node is pruned, it means the algorithm was able to determine that exploring that branch wouldn't lead to a better outcome, saving computation time.

The efficiency of alpha-beta pruning depends on the order of node evaluation - in the best case, it can reduce the number of nodes examined from O(b^d) to O(b^(d/2)), where b is the branching factor and d is the search depth. 