import { filter } from '../utils/filter.js';

//Заводим функцию генерации фильтров, которая принимает в себя список точек
function generateFilter(points) {
  return Object.entries(filter).map(
    ([filterType, filterPoints]) => ({
      type: filterType,
      count: filterPoints(points).length,
    })
  );
}

export { generateFilter };
