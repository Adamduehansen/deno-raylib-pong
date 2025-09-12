import {
  Ball,
  CpuUpdateStrategy,
  Entity,
  Paddle,
  PaddleHeight,
  PaddleWidth,
  PlayerUpdateStrategy,
} from "./entities.ts";
import {
  beginDrawing,
  Black,
  clearBackground,
  closeWindow,
  endDrawing,
  getScreenHeight,
  getScreenWidth,
  initWindow,
  setTargetFPS,
  windowShouldClose,
} from "./raylib-bindings.ts";

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

  const cpuPaddle = new Paddle({
    x: 50,
    y: getScreenHeight() / 2 - PaddleHeight / 2,
    updateStrategy: new CpuUpdateStrategy(ball),
  });
  entities.push(cpuPaddle);

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
    endDrawing();
  }

  closeWindow();
}
