const ROWS = 18;
const COLS = 10;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const linesText = document.getElementById("lines");

let cellSize;
let keyRepeatTimeout = 150;
let keyRepeatDelay = 40;

const pieceLayouts = [
    new Layout(
        [
            "##", //
            "##", //
        ],
        "orange"
    ),
    new Layout(
        [
            "    ", //
            "####", //
            "    ", //
            "    ", //
        ],
        "darkblue"
    ),
    new Layout(
        [
            " # ", //
            "###", //
            "   ", //
        ],
        "purple"
    ),
    new Layout(
        [
            "#  ", //
            "###", //
            "   ", //
        ],
        "blue"
    ),
    new Layout(
        [
            "  #", //
            "###", //
            "   ", //
        ],
        "darkgreen"
    ),
    new Layout(
        [
            " ##", //
            "## ", //
            "   ", //
        ],
        "green"
    ),
    new Layout(
        [
            "## ", //
            " ##", //
            "   ", //
        ],
        "red"
    ),
];

const board = new Array(ROWS).fill().map(() => new Array(COLS).fill(" "));

let lastMoveTime = performance.now();
let activePiece;
let heldPieceLayout;
let alreadyHold = false;
let numLines = 0;

function onUpdate() {
    const now = performance.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    activePiece.draw();

    if (now - lastMoveTime > 200) {
        activePiece.moveY(1);
        lastMoveTime = now;
    }

    ctx.strokeStyle = "#cecece";
    ctx.lineWidth = 1;
    board.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell != " ") {
                ctx.fillStyle = cell;
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }

            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
        });
    });

    activePiece.ghost.draw();

    if (checkKeyPressed("ArrowUp") || checkKeyPressed("KeyX")) {
        activePiece.rotateReverse();
    } else if (checkKeyPressed("ArrowDown")) {
        activePiece.moveY(1);
        lastMoveTime = performance.now();
    } else if (checkKeyPressed("KeyZ")) {
        activePiece.rotate();
    } else if (checkKeyPressed("ArrowRight")) {
        activePiece.moveX(1);
    } else if (checkKeyPressed("ArrowLeft")) {
        activePiece.moveX(-1);
    }

    requestAnimationFrame(onUpdate);
    linesText.textContent = numLines;
}

function resetPiece() {
    const layout = pieceLayouts[Math.floor(Math.random() * pieceLayouts.length)];
    activePiece = new Piece(layout);
    alreadyHold = false;
    board.forEach((row, i) => {
        if (!row.includes(" ")) {
            board.splice(i, 1);
            board.unshift(new Array(COLS).fill(" "));
            numLines += 1;
        }
    });
}

class Key {
    constructor() {
        this.whenPressed = performance.now();
        this.lastCheck = performance.now();
        this.initialCheck = false;
    }

    checkPressed() {
        if (!this.initialCheck) {
            this.initialCheck = true;
            return true;
        }

        const now = performance.now();
        const deltaPressed = now - this.whenPressed;
        const deltaCheck = now - this.lastCheck;
        if (deltaPressed > keyRepeatTimeout && deltaCheck > keyRepeatDelay) {
            this.lastCheck = now;
            return true;
        }
    }
}

let keyDownMap = {};

function checkKeyPressed(code) {
    if (!keyDownMap[code]) return;
    return keyDownMap[code].checkPressed();
}

function onKeyDown(e) {
    if (!e.repeat) {
        keyDownMap[e.code] = new Key();
        if (e.code == "Space") {
            activePiece.hardDrop();
        } else if (e.code == "KeyC" && !alreadyHold) {
            const prevLayout = heldPieceLayout;
            heldPieceLayout = activePiece.layout;
            if (prevLayout) {
                activePiece = new Piece(prevLayout);
            } else {
                resetPiece();
            }
            alreadyHold = true;
        }
    }
}

function onKeyUp(e) {
    delete keyDownMap[e.code];
}

function onResize() {
    const size = innerWidth < innerHeight ? innerWidth : innerHeight;
    canvas.width = size / 2;
    canvas.height = canvas.width * (ROWS / COLS);
    cellSize = canvas.width / COLS;
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("resize", onResize);

resetPiece();
onResize();
onUpdate();
