module.exports = {

  randomRangeInt: (min, max, random = Math.random()) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(random * (max-min)) + min;
  }

};
