import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

const FilterMessage = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.FUTURE]: 'There are no future events now',
};

function createNoPointViewTemplate(filterType) {
  return `<p class="trip-events__msg">${FilterMessage[filterType]}</p>`;
}

export default class NoPointView extends AbstractView {
  #filterType = null;
  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoPointViewTemplate(this.#filterType);
  }
}
