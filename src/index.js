



// TODO: Require, load game states, initial setup, etc. here.

function getSnapshot() {
  // TODO
}

document.addEventListener('DOMContentLoaded', event => {

  

  const context = document
    .getElementById('viewport')
    .getContext('2d');

  // TODO: Fire off event loop, calling functions on current game state.

  setInterval(() => {
    
  }, 1000/fps);


  const snapshots = [];

  setInterval(() => {
    snapshots.push(getSnapshot());
  }, 1000);

});
