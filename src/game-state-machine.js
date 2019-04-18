let currentGameState = undefined;

export default {
  getState: () => currentGameState,

  setState: newGameState => {
    if (currentGameState != null) {
      currentGameState.end();
    }
    currentGameState = newGameState;
    newGameState.start();
  }
};
