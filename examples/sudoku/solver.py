board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 8, 5],
    [0, 0, 1, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 5, 0, 7, 0, 0, 0],
    [0, 0, 4, 0, 0, 0, 1, 0, 0],
    [0, 9, 0, 0, 0, 0, 0, 0, 0],
    [5, 0, 0, 0, 0, 0, 0, 7, 3],
    [0, 0, 2, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 4, 0, 0, 0, 9],
]

# board = [
#   [5, 3, 0, 0, 7, 0, 0, 0, 0],
#   [6, 0, 0, 1, 9, 5, 0, 0, 0],
#   [0, 9, 8, 0, 0, 0, 0, 6, 0],
#   [8, 0, 0, 0, 6, 0, 0, 0, 3],
#   [4, 0, 0, 8, 0, 3, 0, 0, 1],
#   [7, 0, 0, 0, 2, 0, 0, 0, 6],
#   [0, 6, 0, 0, 0, 0, 2, 8, 0],
#   [0, 0, 0, 4, 1, 9, 0, 0, 5],
#   [0, 0, 0, 0, 8, 0, 0, 7, 9],
# ]

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

def solve(r, c):
    if c == 9:
        c = 0
        r += 1

    if r == 9:
        return True

    if board[r][c] > 0:
        return solve(r, c + 1)

    br = r // 3
    bc = c // 3

    for n in range(1, 10):
        i = n - 1

        if not (rows[r][i] or cols[c][i] or blocks[br][bc][i]):
            board[r][c] = n
            rows[r][i] = True
            cols[c][i] = True
            blocks[br][bc][i] = True

            if solve(r, c + 1):
                return True

            board[r][c] = 0
            rows[r][i] = False
            cols[c][i] = False
            blocks[br][bc][i] = False

    return False

def show_row(row):
    display = [' ' if x == 0 else str(x) for x in row]
    chunks = [display[i:i+3] for i in range(0, 9, 3)]
    return ' | '.join(' '.join(chunk) for chunk in chunks)

def show(board):
    rows = [show_row(row) for row in board]
    chunks = [rows[i:i+3] for i in range(0, 9, 3)]
    return '\n------+-------+------\n'.join('\n'.join(chunk) for chunk in chunks)

solve(0, 0)
print(show(board))
