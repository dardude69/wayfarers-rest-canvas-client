export default {

  positionFromDirection: direction => {

    switch (direction) {
      case 'left':
        return { x: -1, y: 0 };
      case 'right':
        return { x: 1, y: 0 };
      case 'up':
        return { x: 0, y: -1 };
      case 'down':
        return { x: 0, y: 1 };
      default:
        throw new Error(direction);
    }

  }

};
