#[derive(Default)]
struct Solver {
    board: [[u8; 9]; 9],
    rows: [[bool; 9]; 9],
    cols: [[bool; 9]; 9],
    blocks: [[[bool; 9]; 3]; 3],
}

fn show_cell(cell: u8) {
    if cell > 0 {
        print!("{cell} ");
    } else {
        print!("  ")
    }
}

fn show_row(row: &[u8; 9]) {
    for &cell in &row[0..3] {
        show_cell(cell);
    }

    print!("| ");

    for &cell in &row[3..6] {
        show_cell(cell);
    }

    print!("| ");

    for &cell in &row[6..9] {
        show_cell(cell);
    }

    println!();
}

fn show(board: &[[u8; 9]; 9]) {
    for row in &board[0..3] {
        show_row(row);
    }

    println!("------+-------+------");

    for row in &board[3..6] {
        show_row(row);
    }

    println!("------+-------+------");

    for row in &board[6..9] {
        show_row(row);
    }
}

fn solve(solver: &mut Solver, mut r: usize, mut c: usize) -> bool {
    if c == 9 {
        c = 0;
        r += 1;
    }

    if r == 9 {
        return true;
    }

    if solver.board[r][c] > 0 {
        return solve(solver, r, c + 1);
    }

    for n in 1..=9_u8 {
        let i = (n - 1) as usize;
        let conflict = solver.rows[r][i] || solver.cols[c][i] || solver.blocks[r / 3][c / 3][i];

        if !conflict {
            solver.board[r][c] = n;
            solver.rows[r][i] = true;
            solver.cols[c][i] = true;
            solver.blocks[r / 3][c / 3][i] = true;

            if solve(solver, r, c + 1) {
                return true;
            }

            solver.board[r][c] = 0;
            solver.rows[r][i] = false;
            solver.cols[c][i] = false;
            solver.blocks[r / 3][c / 3][i] = false;
        }
    }

    false
}

fn main() {
    let board = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 3, 0, 8, 5],
        [0, 0, 1, 0, 2, 0, 0, 0, 0],
        [0, 0, 0, 5, 0, 7, 0, 0, 0],
        [0, 0, 4, 0, 0, 0, 1, 0, 0],
        [0, 9, 0, 0, 0, 0, 0, 0, 0],
        [5, 0, 0, 0, 0, 0, 0, 7, 3],
        [0, 0, 2, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 9],
    ];

    // let board = [
    //     [5, 3, 0, 0, 7, 0, 0, 0, 0],
    //     [6, 0, 0, 1, 9, 5, 0, 0, 0],
    //     [0, 9, 8, 0, 0, 0, 0, 6, 0],
    //     [8, 0, 0, 0, 6, 0, 0, 0, 3],
    //     [4, 0, 0, 8, 0, 3, 0, 0, 1],
    //     [7, 0, 0, 0, 2, 0, 0, 0, 6],
    //     [0, 6, 0, 0, 0, 0, 2, 8, 0],
    //     [0, 0, 0, 4, 1, 9, 0, 0, 5],
    //     [0, 0, 0, 0, 8, 0, 0, 7, 9],
    // ];

    let mut solver = Solver {
        board,
        ..Solver::default()
    };

    for r in 0..9 {
        for c in 0..9 {
            if board[r][c] > 0 {
                let i = (board[r][c] - 1) as usize;
                solver.rows[r][i] = true;
                solver.cols[c][i] = true;
                solver.blocks[r / 3][c / 3][i] = true;
            }
        }
    }

    solve(&mut solver, 0, 0);
    show(&solver.board);
}
