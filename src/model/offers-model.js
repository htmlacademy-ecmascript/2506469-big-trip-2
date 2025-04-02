import Observable from '../framework/observable.js';
export default class OffersModel extends Observable {
  #pointsApiService = null;
  #offers = [];

  constructor({ pointsApiService }) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  async init() {
    try {
      this.#offers = await this.#pointsApiService.offers;
    } catch (error) {
      this.#offers = [];
    }
  }

  //Получим данные из свойства offers
  get offers() {
    return this.#offers;
  }
}
