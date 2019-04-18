import GameState from '.';
import playersApi from '../api/players';

const getContainer = () => document.getElementById('auth');

const getUsernameField = () => document.querySelector('#game #auth .form input[name="username"]');
const getPasswordField = () => document.querySelector('#game #auth .form input[name="password"]');

const getCreatePlayerButton = () => document.querySelector('#game #auth .form button[name="create-player"]');
const getAuthenticatePlayerButton = () => document.querySelector('#game #auth .form button[name="authenticate-player"]');

const getInput = () => [ getFields(), getButtons() ];
const disableInput = () => getFields().forEach(element => element.disabled = true);
const enableInput = () => getFields().forEach(element => element.disabled = false);

const getFields = () => [ getUsernameField(), getPasswordField() ];

const getButtons = () => [ getCreatePlayerButton(), getAuthenticatePlayerButton() ];
const disableButtons = () => getButtons().forEach(element => element.disabled = true);
const enableButtons = () => getButtons().forEach(element => element.disabled = false);

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

    getCreatePlayerButton().removeEventListener('click', this.createPlayer.bind(this));
    getAuthenticatePlayerButton().removeEventListener('click', this.authenticatePlayer.bind(this));
  }

  /* Form actions */

  createPlayer() {
    disableInput();

    

    enableInput();
  }

  authenticatePlayer() {
    disableInput();



    enableInput();
  }
}
