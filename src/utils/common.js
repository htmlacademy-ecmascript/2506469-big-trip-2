function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomInteger(integer) {
  return Math.floor(Math.random() * integer);
}

const isEscapeKey = (evt) => evt.key === 'Escape';

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}


export { getRandomArrayElement, getRandomInteger, isEscapeKey, updateItem };
