'use strict';

import assert from 'assert';

export default class SpriteSheet {
  constructor(image, tileWidth, tileHeight=tileWidth) {
    /*
    assert.strict(image != null);
    assert.strict(tileWidth != null);

    assert.strict((image.width % tileWidth) == 0);
    assert.strict((image.height % tileHeight) == 0);
    */

    this.image = image;

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  getColumns() {
    return this.image.width / this.tileWidth;
  }

  sprite(i, j) {
    let [column, row] = [i, j];
    if (row == null) {
      /* Adjust 1D coordinates to 2D coordinates. */
      column = i % this.getColumns();
      row = Math.floor(i / this.getColumns());
    }

    return {
      draw: (context, dx=0, dy=0) => {
        context.drawImage(this.image,
          column * this.tileWidth,
          row * this.tileHeight,
          this.tileWidth,
          this.tileHeight,
          dx,
          dy,
          this.tileWidth,
          this.tileHeight);
      }
    };
  }

}
