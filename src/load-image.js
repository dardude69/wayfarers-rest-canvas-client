'use strict';

export default url => new Promise((resolve, reject) => {
  const image = new Image();

  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(url));

  image.src = url;
});
