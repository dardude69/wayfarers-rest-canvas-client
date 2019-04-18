import GameState from '.';

export default class PlayGameState extends GameState {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
}
