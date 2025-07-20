from copy import deepcopy

# board = [
#     [0, 0, 0, 0, 0, 0, 0, 0, 0],
#     [0, 0, 0, 0, 0, 3, 0, 8, 5],
#     [0, 0, 1, 0, 2, 0, 0, 0, 0],
#     [0, 0, 0, 5, 0, 7, 0, 0, 0],
#     [0, 0, 4, 0, 0, 0, 1, 0, 0],
#     [0, 9, 0, 0, 0, 0, 0, 0, 0],
#     [5, 0, 0, 0, 0, 0, 0, 7, 3],
#     [0, 0, 2, 0, 1, 0, 0, 0, 0],
#     [0, 0, 0, 0, 4, 0, 0, 0, 9],
# ]

board = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

rows = [[False] * 9 for _ in range(9)]
cols = [[False] * 9 for _ in range(9)]
blocks = [[[False] * 9 for _ in range(3)] for _ in range(3)]

for r, row in enumerate(board):
    for c, n in enumerate(row):
        if n > 0:
            i = n - 1
            rows[r][i] = True
            cols[c][i] = True
            br = r // 3
            bc = c // 3
            blocks[br][bc][i] = True

class Solver:
    def __init__(self, board, rows, cols, blocks):
        self.board = deepcopy(board)
        self.rows = deepcopy(rows)
        self.cols = deepcopy(cols)
        self.blocks = deepcopy(blocks)
        self.solved = False

def solve(solver, r, c):
    if c == 9:
        c = 0
        r += 1
    if r == 9:
        solver.solved = True
        return solver
    if solver.board[r][c] > 0:
        return solve(solver, r, c + 1)

    br = r // 3
    bc = c // 3

    for n in range(1, 10):
        i = n - 1

        if not (solver.rows[r][i] or solver.cols[c][i] or solver.blocks[br][bc][i]):
            copy = Solver(solver.board, solver.rows, solver.cols, solver.blocks)
            copy.board[r][c] = n
            copy.rows[r][i] = True
            copy.cols[c][i] = True
            copy.blocks[br][bc][i] = True

            result = solve(copy, r, c + 1)
            if result.solved:
                return result

    return solver

def show_row(row):
    display = [' ' if x == 0 else str(x) for x in row]
    chunks = [display[i:i+3] for i in range(0, 9, 3)]
    return ' | '.join(' '.join(chunk) for chunk in chunks)

def show(solver):
    rows = [show_row(row) for row in solver.board]
    chunks = [rows[i:i+3] for i in range(0, 9, 3)]
    return '\n------+-------+------\n'.join('\n'.join(chunk) for chunk in chunks)

# Create and solve the puzzle
initial_solver = Solver(board, rows, cols, blocks)
solved = solve(initial_solver, 0, 0)
print(show(solved))
