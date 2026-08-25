document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("game");
  const context = canvas.getContext("2d");

  const scoreP1Elem = document.getElementById("score-p1");
  const scoreP2Elem = document.getElementById("score-p2");

  let player1Score = 0;
  let player2Score = 0;
  let gamePaused = false;
  let requestId;

  const paddleHeight = 80;
  const paddleWidth = 20;

  const player1 = {
    x: 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    color: "#3498db"
  };

  const player2 = {
    x: canvas.width - 30 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    color: "#da6db9" 
  };

  const initialSpeed = 3.5;
  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: initialSpeed,
    dy: initialSpeed,
    color: "#ebe7e6" 
  };

  function draw() {
    context.fillStyle = "#34495e";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const tableMargin = 20;
    context.fillStyle = "#1e824c";
    context.fillRect(tableMargin, tableMargin, canvas.width - tableMargin * 2, canvas.height - tableMargin * 2);

    context.strokeStyle = "#ffffff";
    context.lineWidth = 3;
    context.strokeRect(tableMargin, tableMargin, canvas.width - tableMargin * 2, canvas.height - tableMargin * 2);

    context.beginPath();
    context.setLineDash([6, 6]);
    context.moveTo(canvas.width / 2, tableMargin);
    context.lineTo(canvas.width / 2, canvas.height - tableMargin);
    context.strokeStyle = "#ffffff";
    context.lineWidth = 4;
    context.stroke();
    context.setLineDash([]); 

    drawPlayer(player1, true);
    drawPlayer(player2, false);

    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = ball.color;
    context.fill();
    context.strokeStyle = "#d35400";
    context.lineWidth = 1;
    context.stroke();
    context.closePath();
  }

  // Functie om een poppetje met batje te tekenen
  function drawPlayer(player, isLeft) {
    const headRadius = 10;
    const bodyWidth = player.width;
    const bodyHeight = player.height - headRadius * 2;

    context.fillStyle = player.color;
    context.fillRect(player.x, player.y + headRadius * 2, bodyWidth, bodyHeight);

    context.beginPath();
    context.arc(player.x + bodyWidth / 2, player.y + headRadius, headRadius, 0, Math.PI * 2);
    context.fillStyle = "#f5e39b"; 
    context.fill();
    context.closePath();

    context.beginPath();
    const batX = isLeft ? player.x + bodyWidth + 8 : player.x - 8;
    const batY = player.y + player.height / 2;
    context.arc(batX, batY, 7, 0, Math.PI * 2);
    context.fillStyle = "#c0392b"; 
    context.fill();
    context.closePath();
  }

  function update() {
    if (gamePaused) return;

    player1.y += player1.dy;
    player2.y += player2.dy;

    player1.y = Math.max(20, Math.min(canvas.height - 20 - player1.height, player1.y));
    player2.y = Math.max(20, Math.min(canvas.height - 20 - player2.height, player2.y));

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.radius > canvas.height - 20 || ball.y - ball.radius < 20) {
      ball.dy *= -1;
    }
    if (
      ball.x - ball.radius < player1.x + player1.width &&
      ball.x - ball.radius > player1.x &&
      ball.y > player1.y &&
      ball.y < player1.y + player1.height
    ) {
      ball.dx = Math.abs(ball.dx) + 0.2; 
      ball.x = player1.x + player1.width + ball.radius; 
    }
    if (
      ball.x + ball.radius > player2.x &&
      ball.x + ball.radius < player2.x + player2.width &&
      ball.y > player2.y &&
      ball.y < player2.y + player2.height
    ) {
      ball.dx = -Math.abs(ball.dx) - 0.2; 
      ball.x = player2.x - ball.radius; 
    }

    if (ball.x + ball.radius > canvas.width - 20) {
      player1Score++;
      scoreP1Elem.textContent = player1Score;
      resetBall(-1);
    } else if (ball.x - ball.radius < 20) {
      player2Score++;
      scoreP2Elem.textContent = player2Score;
      resetBall(1);
    }

    draw();
  }

  function resetBall(direction = 1) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = direction * initialSpeed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * initialSpeed;
  }
  const paddleSpeed = 6;

  document.addEventListener("keydown", function(event) {
    if (event.key === "w" || event.key === "W") {
      player1.dy = -paddleSpeed;
    } else if (event.key === "s" || event.key === "S") {
      player1.dy = paddleSpeed;
    } else if (event.key === "ArrowUp") {
      player2.dy = -paddleSpeed;
    } else if (event.key === "ArrowDown") {
      player2.dy = paddleSpeed;
    }
  });

  document.addEventListener("keyup", function(event) {
    if (["w", "W", "s", "S"].includes(event.key)) {
      player1.dy = 0;
    } else if (["ArrowUp", "ArrowDown"].includes(event.key)) {
      player2.dy = 0;
    }
  });

  const pauseButton = document.getElementById("pause");
  pauseButton.addEventListener("click", function() {
    gamePaused = true;
    cancelAnimationFrame(requestId);
  });

  const resumeButton = document.getElementById("resume");
  resumeButton.addEventListener("click", function() {
    if (gamePaused) {
      gamePaused = false;
      gameLoop();
    }
  });

  const resetButton = document.getElementById("reset");
  resetButton.addEventListener("click", function() {
    player1Score = 0;
    player2Score = 0;
    scoreP1Elem.textContent = "0";
    scoreP2Elem.textContent = "0";
    resetBall();
    if (gamePaused) {
      gamePaused = false;
      gameLoop();
    }
  });

  function gameLoop() {
    update();
    if (!gamePaused) {
      requestId = requestAnimationFrame(gameLoop);
    }
  }

  draw();
  gameLoop();
});