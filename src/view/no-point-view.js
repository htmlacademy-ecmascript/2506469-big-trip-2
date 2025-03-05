import AbstractView from '../framework/view/abstract-view.js';
import { FilterMessage } from '../const.js';

function createNoPointViewTemplate(messageType) {
  return `<p class="trip-events__msg">${FilterMessage[messageType]}</p>`;
}

export default class NoPointView extends AbstractView {
  #messageType = null;
  constructor({ messageType }) {
    super();
    this.#messageType = messageType;
  }

  get template() {
    return createNoPointViewTemplate(this.#messageType);
  }
}
