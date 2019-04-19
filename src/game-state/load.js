import assert from 'assert';
import assets from '../assets';
import gameStateMachine from '../game-state-machine';
import GameState from '.';
import loadImage from '../load-image';
import AuthGameState from './auth';

export default class LoadGameState extends GameState {
  constructor(imageFilePaths) {
    super();

    assert(imageFilePaths);

    this.imageFilePaths = imageFilePaths;
  }

  start() {

    Promise.all(this.imageFilePaths.map(path => loadImage(path)))
      .then(images => {
        images.forEach((image, i) => assets.images[this.imageFilePaths[i]] = image);
        gameStateMachine.setState(new AuthGameState());
      })
      .catch(console.error); // TODO: Deal with error (BSoD?)
  }
}
