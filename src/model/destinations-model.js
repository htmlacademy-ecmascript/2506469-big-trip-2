import Observable from '../framework/observable.js';
export default class DestinationsModel extends Observable {
  #destinations = [];
  #pointsApiService = null;

  constructor({ pointsApiService }) {
    super();
    this.#pointsApiService = pointsApiService;

  }

  async init() {
    try {
      this.#destinations = await this.#pointsApiService.destinations;
    } catch (err) {
      this.#destinations = [];
    }
  }

  //Получим данные из свойства destinations
  get destinations() {
    return this.#destinations;
  }
}
