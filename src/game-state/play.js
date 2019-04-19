import GameState from '.';

export default class PlayGameState extends GameState {
  constructor(username, password) {
    super();

    this.username = username;
    this.password = password;
  }
}
