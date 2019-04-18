import gameStateMachine from '../game-state-machine';
import GameState from '.';
import AuthGameState from './auth';

export default class LoadGameState extends GameState {
  start() {
    // TODO: Actually load assets.

    gameStateMachine.setState(new AuthGameState());
  }
}
