import { getRandomPoint } from '../mock/points.js';
import { offers } from '../mock/offers.js';
import { destinations } from '../mock/destinations.js';

const POINT_COUNT = 5;

//Модель точек маршрутов
export default class EventsModel {
  //Запишем в свойство массив точек
  points = Array.from({ length: POINT_COUNT }, getRandomPoint);
  offers = offers;
  destinations = destinations;

  //Получим данные из свойства points
  getPoints() {
    return this.points;
  }

  //Получим данные из свойства offers
  getOffers() {
    return this.offers;
  }

  //Получим данные из свойства destinations
  getDestinations() {
    return this.destinations;
  }
}
