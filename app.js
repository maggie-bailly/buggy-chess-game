<!DOCTYPE html
<html>
<head>
  <style>
    body { font-family: sans-serif; text-align: center; }
    #board {
      display: grid;
      grid-template-columns: repeat(8, 60px);
      grid-template-rows: repeat(8, 60px);
      margin: 20px auto;
      width: 480px;
      border: 2px solid #333;
    }
    .square {
      width: 60px;
      height: 60px;
      font-size: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .light { background: #f0d9b5; }
    .dark { background: #b58863; }
    .selected { outline: 4px solid yellow; }
  </style>
</head>
<body>
  <h1>Buggy Chess</h1>
  <p id="status">White to move</p>
  <div id="board"></div>

  <script>
    const pieces = {
      r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
      R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
    };

    let board = [
      ["r","n","b","q","k","b","n","r"],
      ["p","p","p","p","p","p","p","p"],
      ["","","","","","","",""],
      ["","","","","","","",""],
      ["","","","","","","",""],
      ["","","","","","","",""],
      ["P","P","P","P","P","P","P","P"],
      ["R","N","B","Q","K","B","N","R"]
    ];

    let selected = null;
    let turn = "white";

    function drawBoard() {
      const boardDiv = document.getElementById("board");
      boardDiv.innerHTML = "";

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const square = document.createElement("div");
          square.className = `square ${(r + c) % 2 === 0 ? "light" : "dark"}`;
          square.textContent = pieces[board[r][c]] || "";

          if (selected && selected.r === r && selected.c === c) {
            square.classList.add("selected");
          }

          square.onclick = () => handleClick(r, c);
          boardDiv.appendChild(square);
        }
      }
    }

    function handleClick(r, c) {
      const piece = board[r][c];

      if (!selected) {
        if (piece && isPlayersPiece(piece)) {
          selected = { r, c };
        }
      } else {
        const from = selected;
        const movingPiece = board[from.r][from.c];

        if (isValidMove(movingPiece, from.r, from.c, r, c)) {
          board[r][c] = movingPiece;
          board[from.r][from.c] = "";
          turn = turn === "white" ? "black" : "white";
          document.getElementById("status").textContent =
            `${turn[0].toUpperCase() + turn.slice(1)} to move`;
        }

        selected = null;
      }

      drawBoard();
    }

    function isPlayersPiece(piece) {
      return turn === "white"
        ? piece === piece.toUpperCase()
        : piece === piece.toLowerCase();
    }

    function isEnemy(piece, target) {
      if (!target) return false;
      return piece === piece.toUpperCase()
        ? target === target.toLowerCase()
        : target === target.toUpperCase();
    }

    function isPathClear(r1, c1, r2, c2) {
      const dr = Math.sign(r2 - r1);
      const dc = Math.sign(c2 - c1);

      let r = r1 + dr;
      let c = c1 + dc;

      while (r !== r2 || c !== c2) {
        if (board[r][c]) return false;
        r += dr;
        c += dc;
      }

      return true;
    }

    function isValidMove(piece, r1, c1, r2, c2) {
      if (!piece) return false;

      const target = board[r2][c2];

      if (target && !isEnemy(piece, target)) return false;

      const dr = r2 - r1;
      const dc = c2 - c1;
      const absDr = Math.abs(dr);
      const absDc = Math.abs(dc);

      switch (piece.toLowerCase()) {
        case "p": {
          const dir = piece === "P" ? -1 : 1;

          // BUG 1: Pawns can move two squares from anywhere, not just starting rank.
          if (dc === 0 && !target && (dr === dir || dr === 2 * dir)) {
            return true;
          }

          // BUG 2: Pawns can capture diagonally even if the target square is empty.
          if (absDc === 1 && dr === dir) {
            return true;
          }

          return false;
        }

        case "r":
          return (dr === 0 || dc === 0) && isPathClear(r1, c1, r2, c2);

        case "n":
          return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);

        case "b":
          return absDr === absDc && isPathClear(r1, c1, r2, c2);

        case "q":
          // BUG 3: Queen ignores blocked paths.
          return dr === 0 || dc === 0 || absDr === absDc;

        case "k":
          // BUG 4: King can move two squares in any direction.
          return absDr <= 2 && absDc <= 2;

        default:
          return false;
      }
    }

    drawBoard();
  </script>
</body>
</html>
