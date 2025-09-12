import {
  drawRectangleRec,
  getFrameTime,
  getScreenHeight,
  getScreenWidth,
  isKeyDown,
  KeyS,
  KeyW,
  RayWhite,
} from "./raylib-bindings.ts";

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

  constructor() {
    super();
    this.x = getScreenWidth() / 2 - BallSize / 2;
    this.y = getScreenHeight() / 2 - BallSize / 2;
  }

  override update(): void {
    if (this.y > getScreenHeight() - BallSize || this.y < 0) {
      this.speedY *= -1;
    }

    if (this.x > getScreenWidth() - BallSize || this.x < 0) {
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
}
