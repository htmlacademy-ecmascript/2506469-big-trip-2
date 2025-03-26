function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomInteger(integer) {
  return Math.floor(Math.random() * integer);
}

const isEscapeKey = (evt) => evt.key === 'Escape';

export { getRandomArrayElement, getRandomInteger, isEscapeKey };
