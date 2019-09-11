'use strict';

import assert from 'assert';
import assets from '../assets';
import { easeInOutCubic } from 'easing-utils';
import GameState from '.';
import gameStateMachine from '../game-state-machine';
import { randomRangeInt } from '../math-util';
import messagesApi from '../api/messages';
import playersApi from '../api/players';
import positionUtil from '../position-util';
import rgbToHex from '../rgb-to-hex';
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

const lerp = (a, b, t) => (1-t)*a + t*b;

class PlayGameState extends GameState {
  constructor(username, password, snapshots) {
    super();

    this.username = username;
    this.password = password;
    this.snapshots = snapshots;

    this.canvas = document.getElementById('viewport');
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;

    this.interpolationTime = 0;
    this.interpolationStartTime = Date.now();
    this.changeState(PlayGameState.states.startingFetch);
  }

  start() {
    getContainer().style.visibility = 'visible';
    getSendButton().addEventListener('click', this.sendMessage.bind(this));
  }

  end() {
    getContainer().style.visibility = 'hidden';
  }

  /* BUSINESS LOGIC */

  static get states() {
    return {
      startingFetch: 0,
      interpolatingSnapshots: 1,
      waitingForFetch: 2
    };
  }

  changeState(newState) {
    this.state = newState;

    switch (this.state) {
      case PlayGameState.states.startingFetch:
        this.finishedFetching = false;

        this.updateSnapshots()
          .then(() => this.finishedFetching = true)
          .catch(error => {
            console.error(error);
            this.finishedFetching = true;
          });

        this.changeState(PlayGameState.states.interpolatingSnapshots);
        break;
      case PlayGameState.states.interpolatingSnapshots:
        this.interpolationStartTime = Date.now();
        this.updateMessagesInDOM();

        break;
    }
  }

  async sendMessage() {
    const input = getMessageInput();
    const content = input.value;

    if (content.length === 0) {
      return;
    }

    try {
      await messagesApi.send({
        username: this.username,
        password: this.password,
        content
      });

      input.value = '';
    } catch (error) {
      console.error(error);
    }
  }

  keyPressed(key) {
    /* Move player */

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
      const direction = key.substring(5).toLowerCase();

      playersApi.player(this.username, this.password)
        .move(direction)
        .catch(error => {
          if (error === 409) {
            /* Just a collision, no big deal. */
            /* TODO: Play Pokemon Firered-style "bong" sound effect. */

            return;
          }
          throw error;
        })
        .catch(console.error); // TODO: Properly deal with error.

      return;
    }

    /* Send message */

    if (key === 'Enter') {
      this.sendMessage();
      return;
    }
  }

  get interpolationDuration() {
    return 1000;
  }

  update() {

    switch (this.state) {
      case PlayGameState.states.interpolatingSnapshots:
        this.interpolationTime = Math.min((Date.now()-this.interpolationStartTime) / this.interpolationDuration, 1);

        if (this.interpolationTime === 1) {
          this.changeState(PlayGameState.states.waitingForFetch);
        }

        break;
      case PlayGameState.states.waitingForFetch:
        if (this.finishedFetching) {
          this.changeState(PlayGameState.states.startingFetch);
        }
        break;
    }

  }

  async updateSnapshots() {
    const newSnapshot = await snapshotApi.player(this.username, this.password).get();

    this.snapshots[0] = this.snapshots[1];
    this.snapshots[1] = newSnapshot;
  }

  updateMessagesInDOM() {
    const messageFeed = getMessageFeed();

    messageFeed.innerHTML = '';

    for (let [key, value] of Object.entries(this.snapshots[1].messages).slice(-10)) {
      const li = document.createElement('li');

      const usernameSpan = document.createElement('span');
      usernameSpan.className = 'username';
      usernameSpan.innerText = value.sender.username;

      const idRandom = seedrandom(value.sender.id);

      usernameSpan.style.color = rgbToHex(
        randomRangeInt(64, 255, idRandom()),
        randomRangeInt(64, 255, idRandom()),
        randomRangeInt(64, 255, idRandom())
      );

      const contentSpan = document.createElement('span');
      contentSpan.className = 'content';
      contentSpan.innerText = value.content;

      li.appendChild(usernameSpan);
      li.appendChild(contentSpan);

      messageFeed.appendChild(li);
    }
  }

  /* DRAW STUFF */

  drawBackground(snapshot) {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawTiles(snapshot) {
    const tileSheet = new SpriteSheet(assets.images['assets/images/tileset.png'], tileSize);

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

  get id() {
    if (this._id == null) {
      for (let [id, playerState] of Object.entries(this.snapshots[0].players)) {
        if (playerState.username === this.username) {
          this._id = id;
          break;
        }
      }
    }

    assert(this._id != null);
    return this._id;
  }

  interpolatedPlayerPosition(previousPlayerState, currentPlayerState, t) {
    const x = lerp(previousPlayerState.location.x, currentPlayerState.location.x, t);
    const y = lerp(previousPlayerState.location.y, currentPlayerState.location.y, t);

    return { x, y };
  }

  drawCharactersInterpolated(previousSnapshot, currentSnapshot, t) {
    const characterSheet = new SpriteSheet(assets.images['assets/images/characters.png'], characterSize);

    for (let [id, currentPlayerState] of Object.entries(currentSnapshot.players)) {

      let previousPlayerState = previousSnapshot.players[id];
      if (previousPlayerState == null) {
        previousPlayerState = currentPlayerState;
      }

      const { x, y } = this.interpolatedPlayerPosition(previousPlayerState, currentPlayerState, easeInOutCubic(t));

      characterSheet.sprite(randomRangeInt(0, 23, seedrandom(id)())*4).draw(this.context, x*tileSize*scale, y*tileSize*scale, scale);
    }
  }

  drawSnapshotsInterpolated(previousSnapshot, currentSnapshot, t) {
    this.drawBackground(currentSnapshot);

    this.context.save();

    const { x, y } = this.interpolatedPlayerPosition(
      this.snapshots[0].players[this.id],
      this.snapshots[1].players[this.id],
      easeInOutCubic(t));

    this.context.translate(Math.floor(-x*tileSize*scale + 1280*0.5), Math.floor(-y*tileSize*scale + 720*0.5));

    this.drawTiles(currentSnapshot);
    this.drawCharactersInterpolated(previousSnapshot, currentSnapshot, t);

    this.context.restore();
  }

  draw() {
    this.drawSnapshotsInterpolated(this.snapshots[0], this.snapshots[1], this.interpolationTime);
  }
}

/* Deal with the "we don't have any snapshots" edge case outside the main
 * game state. Clean code. */

export default class extends GameState {
  constructor(username, password) {
    super();

    this.username = username;
    this.password = password;
  }

  start() {
    snapshotApi.player(this.username, this.password)
      .get()
      .then(snapshot => gameStateMachine.setState(new PlayGameState(this.username, this.password, [snapshot, snapshot])))
      .catch(console.error); // TODO: Properly deal with error (retry?)
  }
}
