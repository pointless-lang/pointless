#include <stdio.h>
#include <stdbool.h>

typedef struct {
  int board[9][9];
  bool rows[9][9];
  bool cols[9][9];
  bool blocks[3][3][9];
} Solver;

void showCell(int cell) {
  if (cell > 0) {
    printf("%d ", cell);
  } else {
    printf("  ");
  }
}

void showRow(int row[]) {
  for (int c = 0; c < 3; c++) {
    showCell(row[c]);
  }

  printf("| ");

  for (int c = 3; c < 6; c++) {
    showCell(row[c]);
  }

  printf("| ");

  for (int c = 6; c < 9; c++) {
    showCell(row[c]);
  }

  printf("\n");
}

void show(int board[9][9]) {
  for (int r = 0; r < 3; r++) {
    showRow(board[r]);
  }

  printf("------+-------+------\n");

  for (int r = 3; r < 6; r++) {
    showRow(board[r]);
  }

  printf("------+-------+------\n");

  for (int r = 6; r < 9; r++) {
    showRow(board[r]);
  }
}

bool solve(Solver* solver, int r, int c) {
  if (c == 9) {
    c = 0;
    r++;
  }

  if (r == 9) {
    return true;
  }

  if (solver->board[r][c] > 0) {
    return solve(solver, r, c + 1);
  }

  bool* row = solver->rows[r];
  bool* col = solver->cols[c];
  bool* block = solver->blocks[r / 3][c / 3];

  for (int n = 1; n <= 9; n++) {
    int i = n - 1;

    if (!(row[i] || col[i] || block[i])) {
      solver->board[r][c] = n;
      row[i] = true;
      col[i] = true;
      block[i] = true;

      if (solve(solver, r, c + 1)) {
        return true;
      }

      solver->board[r][c] = 0;
      row[i] = false;
      col[i] = false;
      block[i] = false;
    }
  }

  return false;
}

int main() {
  // Solver solver = {
  //   .board = {
  //     { 0, 0, 0, 0, 0, 0, 0, 0, 0 },
  //     { 0, 0, 0, 0, 0, 3, 0, 8, 5 },
  //     { 0, 0, 1, 0, 2, 0, 0, 0, 0 },
  //     { 0, 0, 0, 5, 0, 7, 0, 0, 0 },
  //     { 0, 0, 4, 0, 0, 0, 1, 0, 0 },
  //     { 0, 9, 0, 0, 0, 0, 0, 0, 0 },
  //     { 5, 0, 0, 0, 0, 0, 0, 7, 3 },
  //     { 0, 0, 2, 0, 1, 0, 0, 0, 0 },
  //     { 0, 0, 0, 0, 4, 0, 0, 0, 9 },
  //   }
  // };

  Solver solver = {
    .board = {
      { 5, 3, 0, 0, 7, 0, 0, 0, 0 },
      { 6, 0, 0, 1, 9, 5, 0, 0, 0 },
      { 0, 9, 8, 0, 0, 0, 0, 6, 0 },
      { 8, 0, 0, 0, 6, 0, 0, 0, 3 },
      { 4, 0, 0, 8, 0, 3, 0, 0, 1 },
      { 7, 0, 0, 0, 2, 0, 0, 0, 6 },
      { 0, 6, 0, 0, 0, 0, 2, 8, 0 },
      { 0, 0, 0, 4, 1, 9, 0, 0, 5 },
      { 0, 0, 0, 0, 8, 0, 0, 7, 9 },
    }
  };

  for (int r = 0; r < 9; r++) {
    for (int c = 0; c < 9; c++) {
      int i = solver.board[r][c] - 1;

      if (i >= 0) {
        solver.rows[r][i] = true;
        solver.cols[c][i] = true;
        solver.blocks[r / 3][c / 3][i] = true;
      }
    }
  }

  solve(&solver, 0, 0);
  show(solver.board);
  return 0;
}
