import {getRandomInteger} from '../util.js';

const maxNumber = 100;
//Данные для пунктов назначения
export const destinations = [
  {
    id: '1',
    description: 'Chamonix, is a beautiful city, a true asian pearl, with crowded streets.',
    name: 'Chamonix',
    pictures: []
  },
  {
    id: '2',
    description: 'Amsterdam, is a beautiful city.',
    name: 'Amsterdam',
    pictures: [
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInteger(maxNumber)}`,
        description: 'Amsterdam building'
      },
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInteger(maxNumber)}`,
        description: 'Amsterdam building'
      },
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInteger(maxNumber)}`,
        description: 'Amsterdam building'
      },
    ]
  },
  {
    id: '3',
    description: 'Geneva is a city in Switzerland that lies at the southern tip of expansive Lac Léman (Lake Geneva).',
    name: 'Geneva',
    pictures: [
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInteger(maxNumber)}`,
        description: 'Geneva photo 1'
      },
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInteger(maxNumber)}`,
        description: 'Geneva photo 2'
      },
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInteger(maxNumber)}`,
        description: 'Geneva photo 3'
      },
      {
        src: `https://loremflickr.com/248/152?random=${getRandomInteger(maxNumber)}`,
        description: 'Geneva photo 4'
      }
    ]
  }
];
