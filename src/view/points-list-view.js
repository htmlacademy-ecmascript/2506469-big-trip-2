import AbstractView from '../framework/view/abstract-view.js';

//идет после сортировки

function createPointsListTemplate() {
  return ('<ul class="trip-events__list"></ul>');
}

export default class PointsListVie extends AbstractView {
  get template() {
    return createPointsListTemplate();
  }
}
