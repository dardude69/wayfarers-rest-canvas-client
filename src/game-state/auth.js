import GameState from '.';
import PlayGameState from './play';
import gameStateMachine from '../game-state-machine';
import playersApi from '../api/players';

const getContainer = () => document.getElementById('auth');
const getUsernameField = () => document.querySelector('#game #auth .form input[name="username"]');
const getPasswordField = () => document.querySelector('#game #auth .form input[name="password"]');
const getCreatePlayerButton = () => document.querySelector('#game #auth .form button[name="create-player"]');
const getAuthenticatePlayerButton = () => document.querySelector('#game #auth .form button[name="authenticate-player"]');

const getFields = () => [ getUsernameField(), getPasswordField() ];
const getButtons = () => [ getCreatePlayerButton(), getAuthenticatePlayerButton() ];
const getInput = () => [ getFields(), getButtons() ];

const getUsername = () => getUsernameField().value;
const getPassword = () => getPasswordField().value;

const disableButtons = () => getButtons().forEach(element => element.disabled = true);
const enableButtons = () => getButtons().forEach(element => element.disabled = false);
const disableInput = () => getFields().forEach(element => element.disabled = true);
const enableInput = () => getFields().forEach(element => element.disabled = false);

export default class AuthGameState extends GameState {
  start() {
    getContainer().style.visibility = 'visible';
    disableButtons();

    getFields().forEach(field => field.addEventListener('input', () => {
      const username = getUsernameField().value;
      const password = getPasswordField().value;

      if (username.length == 0 || password.length == 0) {
        disableButtons();
        return;
      }

      enableButtons();
    }));
    getCreatePlayerButton().addEventListener('click', this.createPlayer.bind(this));
    getAuthenticatePlayerButton().addEventListener('click', this.authenticatePlayer.bind(this));
  }

  end() {
    getContainer().style.visibility = 'hidden';

    disableInput();

    getCreatePlayerButton().removeEventListener('click', this.createPlayer.bind(this));
    getAuthenticatePlayerButton().removeEventListener('click', this.authenticatePlayer.bind(this));
  }

  /* Form actions */
  /* TODO: Nicer errors (fill out a div or something). */

  async createPlayer() {
    disableInput();

    try {
      const username = getUsername();
      const password = getPassword();

      await playersApi.player(username, password).create();

      gameStateMachine.setState(new PlayGameState(username, password));
    } catch (error) {
      alert(error);
    }

    enableInput();
  }

  async authenticatePlayer() {
    disableInput();

    try {
      const username = getUsername();
      const password = getPassword();

      if (await playersApi.player(username, password).authenticate()) {
        gameStateMachine.setState(new PlayGameState(username, password));
      } else {
        alert('Unauthenticated!');
      }
    } catch (error) {
      alert(error);
    }

    enableInput();
  }
}
