import assets from '../assets';
import { easeInOutCubic } from 'easing-utils';
import GameState from '.';
import gameStateMachine from '../game-state-machine';
import messagesApi from '../api/messages';
import playersApi from '../api/players';
import positionUtil from '../position-util';
import snapshotApi from '../api/snapshot';
import SpriteSheet from '../sprite-sheet';
import seedrandom from 'seedrandom';

const getContainer = () => document.getElementById('play');

const getSendButton = () => document.querySelector('#game #play #messages button');
const getMessageInput = () => document.querySelector('#game #play #messages input');
const getMessageFeed = () => document.querySelector('#game #play #messages ul');

const scale = 3;
const tileSize = 16;
const characterSize = 16;
const tickRate = 2;

const lerp = (a, b, t) => (1-t)*a + t*b;

class PlayGameState extends GameState {
  constructor(username, password, snapshots) {
    super();

    this.username = username;
    this.password = password;
    this.snapshots = snapshots;

    this.lastSnapshotTime = Date.now();

    this.canvas = document.getElementById('viewport');
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;

    this.targetPositionToPlayerPosition();
  }

  start() {
    getContainer().style.visibility = 'visible';

    getSendButton().addEventListener('click', () => {
      const text = getMessageInput().value;
      if (text.length === 0) {
        return;
      }

      const playerState = this.getLocalPlayerState();

      messagesApi.send(`${playerState.username}: ${text}`)
        .catch(console.error);
    });
  }

  end() {
    getContainer().style.visibility = 'hidden';
  }

  getLocalPlayerState() {
    /* This is the function that confirms that I have given up. */

    for (let [id, playerState] of Object.entries(this.snapshots[1].players)) {
      if (playerState.username == this.username) {
        return playerState;
      }
    }
  }

  targetPositionToPlayerPosition() {
    const { x, y } = this.getLocalPlayerState().location;
    this.targetPosition = { x, y };
  }

  drawBackground(snapshot) {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawTiles(snapshot) {
    const tileSheet = new SpriteSheet(assets.images['./assets/tileset.png'], tileSize);

    for (let y = 0; y < snapshot.map.height; ++y) {
      for (let x = 0; x < snapshot.map.width; ++x) {
        for (let z = 0; z < snapshot.map.tiles.length; ++z) {

          const tileValue = snapshot.map.tiles[z][y][x];
          if (tileValue !== 0) {
            tileSheet.sprite(tileValue-1).draw(this.context, x*tileSize*scale, y*tileSize*scale, scale);
          }

        }
      }
    }
  }

  getInterpolatedPlayerPosition(t) {
    const playerState = this.getLocalPlayerState();

    return {
      x: lerp(this.targetPosition.x, playerState.location.x, easeInOutCubic(t)),
      y: lerp(this.targetPosition.y, playerState.location.y, easeInOutCubic(t))
    };
  }

  static getRandomInt(random, min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(random * (max-min)) + min;
  }

  drawCharactersInterpolated(previousSnapshot, currentSnapshot, t) {
    const characterSheet = new SpriteSheet(assets.images['./assets/characters.png'], characterSize);

    for (let [id, playerState] of Object.entries(currentSnapshot.players)) {
      let x = undefined;
      let y = undefined;

      if (playerState.username === this.username) {
        // Why did flipping the parameters fix this?
        // I'm so confused.
        // Nothing here makes sense.

        const interpolated = this.getInterpolatedPlayerPosition(t);

        x = interpolated.x;
        y = interpolated.y;
      } else {
        x = playerState.location.x;
        y = playerState.location.y;
      }

      characterSheet.sprite(PlayGameState.getRandomInt(seedrandom(playerState.username)(), 0, 23)*4).draw(this.context, x*tileSize*scale, y*tileSize*scale, scale);
    }
  }

  drawSnapshotsInterpolated(previousSnapshot, currentSnapshot, t) {
    this.drawBackground(currentSnapshot);

    this.context.save();
    const { x, y } = this.getInterpolatedPlayerPosition(t);

    this.context.translate(Math.floor(-x*tileSize*scale + 1280*0.5), Math.floor(-y*tileSize*scale + 720*0.5));

    this.drawTiles(currentSnapshot);
    this.drawCharactersInterpolated(previousSnapshot, currentSnapshot, t);

    this.context.restore();
  }

  keyPressed(key) {

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
      const direction = key.substring(5).toLowerCase();

      playersApi.player(this.username, this.password).move(direction)
        .catch(error => {
          if (error === 409) {
            /* Just a collision, no big deal. */

            /* TODO: Play Pokemon Firered-style "bong" sound effect. */
            return;
          }

          throw error;
        })
        .catch(console.error); // TODO: Properly deal with error.

      /* The world's shittiest prediction. */

      const { x: directionX, y: directionY } = positionUtil.positionFromDirection(direction);

      this.targetPosition.x += directionX;
      this.targetPosition.y += directionY;
    }

  }

  static escapeHtml(s) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(s));
    return div.innerHTML;
  }

  async fetchSnapshot() {
    try {
      this.fetchingSnapshot = true;

      const newSnapshot = await snapshotApi.player(this.username, this.password).get();

      this.snapshots[0] = this.snapshots[1];
      this.snapshots[1] = newSnapshot;
      this.lastSnapshotTime = Date.now();
      this.fetchingSnapshot = false;



      this.targetPositionToPlayerPosition();


      const messageFeed = getMessageFeed();
      messageFeed.innerHTML = '';

      Object.keys(newSnapshot.messages)
        .map(key => parseInt(key))
        .sort()
        .slice(-16)
        .reverse()
        .forEach(key => {
          const message = newSnapshot.messages[key];

          messageFeed.innerHTML += `<li>${PlayGameState.escapeHtml(message.body)}</li>`;
        });

    } catch (error) {
      console.error(error);
      this.fetchingSnapshot = false;
    }
  }

  getMaxSnapshotInterval() {
    /* "Max" in case player movement can ask for a snapshot later. */
    return 1000 * (1 / tickRate);
  }

  update() {
    /* I wanted to do this with Promise.race on setTimeout and player input promises,
     * but that sounds brittle.
     * I mean, this entire class is brittle tbh. */

    if (!this.fetchingSnapshot) {
      if (this.lastSnapshotTime+this.getMaxSnapshotInterval() < Date.now()) {
        this.fetchSnapshot();
      }
    }
  }

  draw() {
    this.drawSnapshotsInterpolated(
      this.snapshots[0],
      this.snapshots[1],
      Math.min(1, 0.25 * this.getMaxSnapshotInterval() / (Date.now()-this.lastSnapshotTime)));
  }
}

export default class extends GameState {
  constructor(username, password) {
    super();

    this.username = username;
    this.password = password;
  }

  start() {
    snapshotApi.player(this.username, this.password).get()
      .then(snapshot => gameStateMachine.setState(new PlayGameState(this.username, this.password, [snapshot, snapshot])))
      .catch(console.error); // TODO: Properly deal with error (retry?)
  }
}
