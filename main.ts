import {
  beginDrawing,
  Black,
  checkCollisionRecs,
  clearBackground,
  closeWindow,
  drawRectangleRec,
  drawText,
  endDrawing,
  getFrameTime,
  getScreenHeight,
  getScreenWidth,
  initWindow,
  isKeyDown,
  KeyS,
  KeyW,
  measureText,
  RayWhite,
  Rectangle,
  setTargetFPS,
  windowShouldClose,
} from "./raylib-bindings.ts";

let playerScore = 0;
let cpuScore = 0;

export abstract class Entity {
  x = 0;
  y = 0;

  abstract render(): void;
  abstract update(): void;
}

const PaddleSpeed = 200;

interface PaddleUpdateStrategy {
  update: (paddle: Paddle) => void;
}

export class PlayerUpdateStrategy implements PaddleUpdateStrategy {
  update(paddle: Paddle) {
    const time = getFrameTime();
    if (isKeyDown(KeyS) && paddle.y < getScreenHeight() - PaddleHeight) {
      paddle.y += PaddleSpeed * time;
    } else if (isKeyDown(KeyW) && paddle.y > 0) {
      paddle.y -= PaddleSpeed * time;
    }
  }
}

export class CpuUpdateStrategy implements PaddleUpdateStrategy {
  #ball: Ball;

  constructor(ball: Ball) {
    this.#ball = ball;
  }

  update(paddle: Paddle) {
    const time = getFrameTime();
    if (
      this.#ball.y > paddle.y && paddle.y < getScreenHeight() - PaddleHeight
    ) {
      paddle.y += PaddleSpeed * time;
    } else if (this.#ball.y < paddle.y) {
      paddle.y -= PaddleSpeed * time;
    }
  }
}

interface PaddleArgs {
  x: number;
  y: number;
  updateStrategy: PaddleUpdateStrategy;
}

export const PaddleWidth = 20;
export const PaddleHeight = 80;

export class Paddle extends Entity {
  #updateStrategy: PaddleUpdateStrategy;

  constructor(args: PaddleArgs) {
    super();
    this.x = args.x;
    this.y = args.y;
    this.#updateStrategy = args.updateStrategy;
  }

  override update(): void {
    this.#updateStrategy.update(this);
  }

  override render(): void {
    drawRectangleRec({
      x: this.x,
      y: this.y,
      height: PaddleHeight,
      width: PaddleWidth,
    }, RayWhite);
  }
}

const BallSize = 20;
const BallSpeed = 120;

export class Ball extends Entity {
  speedX = Math.floor(Math.random() * 2) === 0 ? BallSpeed : -BallSpeed;
  speedY = Math.floor(Math.random() * 2) === 0 ? BallSpeed : -BallSpeed;

  playerPaddle?: Paddle;
  cpuPaddle?: Paddle;

  constructor() {
    super();
    this.x = getScreenWidth() / 2 - BallSize / 2;
    this.y = getScreenHeight() / 2 - BallSize / 2;
  }

  setPlayerPaddle(paddle: Paddle): void {
    this.playerPaddle = paddle;
  }

  setCpuPaddle(paddle: Paddle): void {
    this.cpuPaddle = paddle;
  }

  override update(): void {
    if (this.y > getScreenHeight() - BallSize || this.y < 0) {
      this.speedY *= -1;
    }

    if (this.x > getScreenWidth() - BallSize) {
      cpuScore += 1;
      this.reset();
    }

    if (this.x < 0) {
      playerScore += 1;
      this.reset();
    }

    const ballRec: Rectangle = {
      x: this.x,
      y: this.y,
      width: BallSize,
      height: BallSize,
    };

    const playerPaddleRec: Rectangle = {
      x: this.playerPaddle?.x ?? 0,
      y: this.playerPaddle?.y ?? 0,
      width: PaddleWidth,
      height: PaddleHeight,
    };

    const cpuPaddleRec: Rectangle = {
      x: this.cpuPaddle?.x ?? 0,
      y: this.cpuPaddle?.y ?? 0,
      width: PaddleWidth,
      height: PaddleHeight,
    };

    if (
      checkCollisionRecs(ballRec, playerPaddleRec) ||
      checkCollisionRecs(ballRec, cpuPaddleRec)
    ) {
      this.speedX *= -1;
    }

    const time = getFrameTime();
    this.x += this.speedX * time;
    this.y += this.speedY * time;
  }

  override render(): void {
    drawRectangleRec({
      x: this.x,
      y: this.y,
      height: BallSize,
      width: BallSize,
    }, RayWhite);
  }

  private reset(): void {
    this.x = getScreenWidth() / 2 - BallSize / 2;
    this.y = getScreenHeight() / 2 - BallSize / 2;
    this.speedX = Math.floor(Math.random() * 2) === 0 ? BallSpeed : -BallSpeed;
    this.speedY = Math.floor(Math.random() * 2) === 0 ? BallSpeed : -BallSpeed;
  }
}

if (import.meta.main) {
  initWindow({
    title: "Deno Raylib Ping Pong",
    width: 800,
    height: 450,
  });

  setTargetFPS(60);

  const entities: Entity[] = [];
  const ball = new Ball();
  entities.push(ball);

  const playerPaddle = new Paddle({
    x: getScreenWidth() - PaddleWidth - 50,
    y: getScreenHeight() / 2 - PaddleHeight / 2,
    updateStrategy: new PlayerUpdateStrategy(),
  });
  entities.push(playerPaddle);
  ball.setPlayerPaddle(playerPaddle);

  const cpuPaddle = new Paddle({
    x: 50,
    y: getScreenHeight() / 2 - PaddleHeight / 2,
    updateStrategy: new CpuUpdateStrategy(ball),
  });
  entities.push(cpuPaddle);
  ball.setCpuPaddle(cpuPaddle);

  while (windowShouldClose() === false) {
    // Update
    // ------------------------------------------------------------------------
    for (const entity of entities) {
      entity.update();
    }

    // Drawing
    // ------------------------------------------------------------------------
    beginDrawing();
    clearBackground(Black);
    for (const entity of entities) {
      entity.render();
    }
    drawText({
      text: cpuScore.toString(),
      color: RayWhite,
      fontSize: 32,
      posX: 10,
      posY: 10,
    });
    drawText({
      text: playerScore.toString(),
      color: RayWhite,
      fontSize: 32,
      posX: getScreenWidth() - measureText(playerScore.toString(), 32) - 10,
      posY: 10,
    });
    endDrawing();
  }

  closeWindow();
}
