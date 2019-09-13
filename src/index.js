'use strict';

import gameStateMachine from './game-state-machine';
import LoadGameState from './game-state/load';

document.addEventListener('DOMContentLoaded', async () => {

  const keysDown = new Set();

  document.addEventListener('keydown', event => {
    if (!keysDown.has(event.key)) {
      keysDown.add(event.key);
      gameStateMachine.getState().keyPressed(event.key);
    }
  });

  document.addEventListener('keyup', event => {
    if (keysDown.has(event.key)) {
      keysDown.delete(event.key);
      gameStateMachine.getState().keyReleased(event.key);
    }
  });
  
  const gameLoop = () => {
    const dt = 1/60;

    let previousTimestamp = undefined;
    let accumulator = 0;

    const frame = timestamp => {

      const gameState = gameStateMachine.getState();

      timestamp /= 1000; // Work in seconds

      /* Update */

      if (previousTimestamp !== undefined) {
        const frameTime = timestamp - previousTimestamp;
        accumulator += frameTime;

        while (accumulator >= dt) {

          accumulator -= dt;
        }

        keysDown.forEach(key => gameState.keyDown(key));
        gameState.update(frameTime);
      }

      previousTimestamp = timestamp;

      gameState.draw();

      window.requestAnimationFrame(frame);
    };

    window.requestAnimationFrame(frame);

  }

  gameStateMachine.setState(new LoadGameState([
    require('./assets/images/tileset.png'),
    require('./assets/images/characters.png')
  ]));

  gameLoop();

});
