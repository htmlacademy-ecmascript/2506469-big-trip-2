import AbstractView from '../framework/view/abstract-view.js';

function createPointsListTemplate() {
  return ('<ul class="trip-events__list"></ul>');
}

export default class PointsListVie extends AbstractView {
  get template() {
    return createPointsListTemplate();
  }
}
