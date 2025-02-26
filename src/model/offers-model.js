import { offers } from '../mock/offers.js';

export default class OffersModel {

  #offers = offers;

  //Получим данные из свойства offers
  get offers() {
    return this.#offers;
  }
}
