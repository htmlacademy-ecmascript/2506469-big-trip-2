import { FilterType } from '../const.js';
import { isPointsPassed, isPointsPlanned, isPointsCurrent } from './point.js';

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.PAST]: (points) => points.filter((point) => isPointsPassed(point.dateTo)),
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointsPlanned(point.dateFrom)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointsCurrent(point.dateFrom, point.dateTo)),
};


export { filter };
