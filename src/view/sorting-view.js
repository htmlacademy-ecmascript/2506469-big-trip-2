import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../const.js';

function createSortingItemViewTemplate() {
  return Object.values(SortType).map((item) =>
    `<div class="trip-sort__item  trip-sort__item--${item.text}">
        <input id="sort-${item.text}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-${item.text}" ${item.isChecked ? 'checked' : ''} ${item.isDisabled ? 'disabled' : ''}>
        <label class="trip-sort__btn" for="sort-${item.text}" data-sort-type="${item.text}">${item.text}</label>
    </div>`).join('');
}

function createSortingViewTemplate() {
  return (
    `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
      ${createSortingItemViewTemplate()}
    </form>`
  );
}

export default class SortingView extends AbstractView {

  #handleSortTypeChange = null;

  constructor({ onSortTypeChange }) {
    super();
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortingViewTemplate();
  }

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }

    evt.preventDefault();
    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };
}
