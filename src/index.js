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
  
  function gameLoop() {
    const gameState = gameStateMachine.getState();

    keysDown.forEach(key => gameState.keyDown(key));

    gameState.update();
    gameState.draw();

    window.requestAnimationFrame(gameLoop);
  }

  gameStateMachine.setState(new LoadGameState([
    require('./assets/tileset.png'),
    require('./assets/characters.png')
  ]));
  window.requestAnimationFrame(gameLoop);

});
