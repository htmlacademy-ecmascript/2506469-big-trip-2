import { destinations } from '../mock/destinations.js';

export default class DestinationsModel {

  #destinations = destinations;

  //Получим данные из свойства destinations
  get destinations() {
    return this.#destinations;
  }
}
