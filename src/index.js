'use strict';

import loadImage from './load-image';
import SpriteSheet from './sprite-sheet';

async function getSnapshot() {
  const response = await fetch('https://localhost:8000/api/v1/snapshot/zak', {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Basic ' + Buffer.from('zak:password').toString('base64')
    })
  });
  return await response.json();
}

document.addEventListener('DOMContentLoaded', async event => {

  const canvas = document.getElementById('viewport');
  const context = canvas.getContext('2d');

  const snapshot = await getSnapshot();

  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // NOTE
  //
  // Tiled uses 0 for nothing, starts indexing at 1 as the top-left corner.
  //
  // If the tile isn't 0, subtract 1 from coords before passing for rendering
  // here.

  console.log(snapshot);

  const [tileSheetImage, characterSheetImage] = await Promise.all([loadImage('tileset.png'), loadImage('F_01.png')]);

  const tileSheet = new SpriteSheet(tileSheetImage, 32);
  const characterSheet = new SpriteSheet(characterSheetImage, 16);

  for (let y = 0; y < snapshot.map.height; ++y) {
    for (let x = 0; x < snapshot.map.width; ++x) {
      for (let z = 0; z < snapshot.map.tiles.length; ++z) {

        const tileValue = snapshot.map.tiles[z][y][x];
        if (tileValue !== 0) {
          tileSheet.sprite(tileValue-1).draw(context, x*32, y*32);
        }

      }

      for (let [id, playerState] of Object.entries(snapshot.players)) {
        if (x == playerState.location.x && y == playerState.location.y) {
          characterSheet.sprite(0).draw(context, x*32 + 8, y*32 + 8);
        }
      }

    }
  }

});
