function getRandomInteger(integer) {
  return Math.floor(Math.random() * integer);
}

const isEscapeKey = (evt) => evt.key === 'Escape';

export { getRandomInteger, isEscapeKey };
