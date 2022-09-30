class Layout {
    constructor(matrix, color) {
        this.matrix = matrix;
        this.color = color;
    }
}

class Piece {
    constructor(layout, isGhost = false) {
        this.layout = layout;
        this.matrix = layout.matrix.map((row) => {
            const newRow = [];
            for (const cell of row) {
                newRow.push(cell == "#" ? layout.color : " ");
            }

            return newRow;
        });

        this.isGhost = isGhost;
        if (!isGhost) this.ghost = new Piece(layout, true);

        this.x = Math.floor(COLS / 2 - layout.matrix[0].length / 2);
        this.y = 0;
        this.resetGhost();
    }

    resetGhost(updateFunc) {
        if (this.ghost) {
            this.ghost.y = this.y;
            this.ghost.x = this.x;
            if (updateFunc) updateFunc();
            this.ghost.hardDrop();
        }
    }

    forEachCell(func) {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[0].length; j++) {
                const result = func(this.matrix[i][j], this.x + j, this.y + i);
                if (result) return true;
            }
        }

        return false;
    }

    draw() {
        ctx.lineWidth = 3;
        if (this.isGhost) ctx.globalAlpha = 0.2;
        this.forEachCell((cell, x, y) => {
            if (cell != " ") {
                ctx.fillStyle = cell;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        });

        ctx.globalAlpha = 1;
    }

    hardDrop() {
        while (this.moveY(1));
    }

    moveY(y) {
        this.y += y;
        if (this.checkCollide()) {
            this.y -= y;
            if (!this.isGhost) {
                this.blitOntoBoard();
                resetPiece();
            }

            return false;
        } else return true;
    }

    moveX(x) {
        this.x += x;
        if (this.checkCollide()) this.x -= x;
        this.resetGhost();
    }

    rotate() {
        this.matrix = this.matrix[0].map((_, i) => this.matrix.map((row) => row[i]).reverse());
        this.resetGhost(() => this.ghost.rotate());

        if (this.checkCollide()) {
            this.rotateReverse();
        }
    }

    rotateReverse() {
        this.matrix = this.matrix[0].map((_, i) =>
            this.matrix.map((row) => row[row.length - 1 - i])
        );

        this.resetGhost(() => this.ghost.rotateReverse());

        if (this.checkCollide()) {
            this.rotateReverse();
        }
    }

    checkCollide() {
        return this.forEachCell((cell, x, y) => {
            if (cell != " ") {
                if (y >= ROWS || x >= COLS || x < 0 || board[y][x] != " ") return true;
            }
        });
    }

    blitOntoBoard() {
        this.forEachCell((cell, x, y) => {
            if (cell != " ") {
                board[y][x] = cell;
            }
        });
    }
}
