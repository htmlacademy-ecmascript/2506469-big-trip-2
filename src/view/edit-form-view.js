import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { createFormOffersTemplate, humanizeTaskDueDate, createDestinationList, createEventTypeItem } from '../utils/point.js';
import { DATE_TIME_FORMAT } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';

function createPictures(pictures) {
  if (Array.isArray(pictures)) {
    return pictures
      .map((picture) =>
        `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
      )
      .join('');
  } else {
    return '';
  }
}

function createEditFormViewTemplate(point, offers, destinations) {
  const { type, basePrice, dateFrom, dateTo } = point;

  const editFormPointDestination = destinations.find((destination) => destination.id === point.destination) || {};

  const pointTypeOffer = offers.find((offer) => offer.type === point.type);

  if (!pointTypeOffer) {
    return '';
  }

  const editFormOffersTemplate = createFormOffersTemplate(pointTypeOffer.offers, point.offers);

  const destinationPictures = editFormPointDestination
    ? createPictures(editFormPointDestination.pictures)
    : '';

  const destinationListTemplate = createDestinationList(destinations);

  const eventTypeItemTemplate = createEventTypeItem(offers);

  const startDate = humanizeTaskDueDate(dateFrom, DATE_TIME_FORMAT);
  const endDate = humanizeTaskDueDate(dateTo, DATE_TIME_FORMAT);

  return `<form class="event event--edit" action="#" method="post">
                <header class="event__header">
                  <div class="event__type-wrapper">
                    <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                    </label>
                    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
                    <div class="event__type-list">
                      <fieldset class="event__type-group">
                        <legend class="visually-hidden">Event type</legend>
                        ${eventTypeItemTemplate}
                      </fieldset>
                    </div>
                  </div>
                  <div class="event__field-group  event__field-group--destination">
                    <label class="event__label  event__type-output" for="event-destination-1">
                    ${type}
                    </label>
                     <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${editFormPointDestination?.name || ''}" list="destination-list-1">
                    <datalist id="destination-list-1">
                    ${destinationListTemplate}
                    </datalist>
                  </div>
                  <div class="event__field-group  event__field-group--time">
                    <label class="visually-hidden" for="event-start-time-1">From</label>
                    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startDate}">
                    &mdash;
                    <label class="visually-hidden" for="event-end-time-1">To</label>
                    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDate}">
                  </div>
                  <div class="event__field-group  event__field-group--price">
                    <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                    </label>
                     <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${he.encode(String(basePrice))}">
                  </div>
                  <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
                  <button class="event__reset-btn" type="reset">Delete</button>
                  <button class="event__rollup-btn" type="button">
                    <span class="visually-hidden">Open event</span>
                  </button>
                </header>
                <section class="event__details">
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                    <div class="event__available-offers">
                    ${offers.length !== 0 ? editFormOffersTemplate : ''}
                    </div>
                  </section>
                  <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${editFormPointDestination?.description || ''}</p>
                     <div class="event__photos-container">
                      <div class="event__photos-tape">
                        ${destinationPictures}
                      </div>
                    </div>
                  </section>
                </section>
              </form>`;
}

export default class EditFormView extends AbstractStatefulView {
  #handleDeleteClick = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  #offers = null;
  #destinations = null;
  #handleSubmit = null;

  constructor({point, offers, destinations, onSubmit, onDeleteClick}) {
    super();
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleSubmit = onSubmit;
    this.#handleDeleteClick = onDeleteClick;

    this._setState(EditFormView.parsePointToState(point));
    this._restoreHandlers();
  }

  get template() {
    return createEditFormViewTemplate(this._state, this.#offers, this.#destinations);
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#submitHandler);
    this.element.addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#changeTypeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#changeDestinationHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#changePriceHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formDeleteClickHandler);

    this.#setDatepicker();
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#handleSubmit(EditFormView.parseStateToPoint(this._state));
  };

  #changeTypeHandler = (evt) => {
    if (evt.target.closest('input')) {
      this.updateElement({
        type: evt.target.value
      });
    }
  };

  #changeDestinationHandler = (evt) => {
    const selectedDestination = this.#destinations.find((destination) => destination.name === evt.target.value);

    if (!selectedDestination) {
      return;
    }

    this.updateElement({
      destination: selectedDestination.id
    });

  };

  #changePriceHandler = (evt) => {
    this._setState({
      basePrice: Number(evt.target.value)
    });
  };


  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(EditFormView.parseStateToPoint(this._state));
  };

  //Сброс компонента к изначальному виду
  reset(point) {
    this.updateElement(EditFormView.parsePointToState(point));
  }

  static parsePointToState(point) {
    return { ...point };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    return point;
  }

  #setDatepicker() {
    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-start-time-1'), {
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.startDate,
      onChange: this.#changeStartDateHandler
    }
    );

    this.#datepickerEnd = flatpickr(
      this.element.querySelector('#event-end-time-1'), {
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.endDate,
      minDate: this._state.dateFrom,
      onChange: this.#changeEndDateHandler
    }
    );
  }

  #changeStartDateHandler = ([userDate]) => {
    this.updateElement({
      startDate: userDate,
    });
    this.#datepickerEnd.set('minDate', userDate);
  };

  #changeEndDateHandler = ([userDate]) => {
    this.updateElement({
      endDate: userDate,
    });
  };

  removeElement() {
    super.removeElement();

    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }

    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }

}
