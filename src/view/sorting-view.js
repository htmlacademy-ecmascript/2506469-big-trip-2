import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../const.js';

function createSortingItemViewTemplate(currentSortType) {
  return Object.values(SortType).map((item) =>
    `<div class="trip-sort__item  trip-sort__item--${item.text}">
        <input id="sort-${item.text}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-${item.text}" ${currentSortType === item.text || item.isChecked ? 'checked' : ''} ${item.isDisabled ? 'disabled' : ''}>
        <label class="trip-sort__btn" for="sort-${item.text}" data-sort-type="${item.text}">${item.text}</label>
    </div>`).join('');
}

function createSortingViewTemplate(currentSortType) {
  return (
    `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    ${createSortingItemViewTemplate(currentSortType)}
    </form>`
  );
}

export default class SortingView extends AbstractView {
  #currentSortType = null;
  #handleSortTypeChange = null;

  constructor({ currentSortType, onSortTypeChange }) {
    super();
    this.#handleSortTypeChange = onSortTypeChange;
    this.#currentSortType = currentSortType;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortingViewTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }

    const inputElement = this.element.querySelector(`#sort-${evt.target.dataset.sortType}`);
    if (inputElement.disabled) {
      return;
    }

    evt.preventDefault();
    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };
}
