import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { convertDateToISO, humanizeDate } from '../utils/common.js';
import { DATE_TIME_FORMAT } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';

function createDestinationList(destinations) {
  return destinations.map((destination) => `<option value="${destination.name}"></option>`).join('');
}

function createFormOffersTemplate(pointOffers, point) {
  return pointOffers
    .map((offer) => {
      const checked = point.includes(offer.id) ? 'checked' : '';
      return `<div class="event__offer-selector">
                        <input class="event__offer-checkbox  visually-hidden"
                        id="event-offer-${offer.id}"
                        data-offer-id="${offer.id}"
                        type="checkbox"
                        name="event-offer-${offer.type}-${offer.id}"
                        ${checked}
                        ${point.isDisabled ? 'disabled' : ''}>
                        <label class="event__offer-label" for="event-offer-${offer.id}">
                          <span class="event__offer-title">${offer.title}</span>
                          &plus;&euro;&nbsp;
                          <span class="event__offer-price">${offer.price}</span>
                        </label>
                      </div>`;
    }).join('');
}

function createEventTypeItem(offers) {
  return offers.map((offer) => `<div class="event__type-item">
  <input id="event-type-${offer.type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${offer.type}">
  <label class="event__type-label  event__type-label--${offer.type}" for="event-type-${offer.type}-1">${(offer.type)[0].toUpperCase() + (offer.type).slice(1)}</label>
</div>`).join('');
}

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

function createEditFormViewTemplate(point, offers, destinations, isCreating) {
  const { type, basePrice, dateFrom, dateTo, isDisabled, isSaving, isDeleting } = point;

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

  const startDate = humanizeDate(dateFrom, DATE_TIME_FORMAT);
  const endDate = humanizeDate(dateTo, DATE_TIME_FORMAT);

  const hasDestinationContent = editFormPointDestination.description || destinationPictures;

  const hasOffers = pointTypeOffer.offers && pointTypeOffer.offers.length > 0;

  let resetButtonText;
  if (isDeleting) {
    resetButtonText = 'Deleting...';
  } else if (isCreating) {
    resetButtonText = 'Cancel';
  } else {
    resetButtonText = 'Delete';
  }

  return `<li class="trip-events__item">
              <form class="event event--edit" action="#" method="post">
                <header class="event__header">
                  <div class="event__type-wrapper">
                    <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                    </label>
                     <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? 'disabled' : ''}>
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
                      <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${editFormPointDestination?.name || ''}" list="destination-list-1" ${isDisabled ? 'disabled' : ''}>
                    <datalist id="destination-list-1">
                    ${destinationListTemplate}
                    </datalist>
                  </div>

                  <div class="event__field-group  event__field-group--time">
                    <label class="visually-hidden" for="event-start-time-1">From</label>
                     <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${isCreating ? '' : startDate}" ${isDisabled ? 'disabled' : ''}>
                    &mdash;
                    <label class="visually-hidden" for="event-end-time-1">To</label>
                     <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${isCreating ? '' : endDate}" ${isDisabled ? 'disabled' : ''}>
                  </div>

                  <div class="event__field-group  event__field-group--price">
                    <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                    </label>
                      <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${he.encode(String(basePrice))}" ${isDisabled ? 'disabled' : ''}>
                  </div>

                  <button class="event__save-btn  btn  btn--blue"
                  type="submit" ${isDisabled ? 'disabled' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
                  <button class="event__reset-btn" type="reset">${resetButtonText}</button>
                  ${!isCreating ? `
                    <button class="event__rollup-btn" type="button">
                      <span class="visually-hidden">Open event</span>
                    </button>` : ''}
                </header>
                <section class="event__details">
                ${hasOffers ? `
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                    <div class="event__available-offers">
                    ${editFormOffersTemplate}
                    </div>
                   </section>` : ''}

                    ${hasDestinationContent ? `
                  <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                     ${editFormPointDestination.description ? `<p class="event__destination-description">${editFormPointDestination.description}</p>` : ''}
                    ${destinationPictures ? `
                    <div class="event__photos-container">
                      <div class="event__photos-tape">
                        ${destinationPictures}
                      </div>
                    </div>` : ''}
                  </section>` : ''}
                </section>
              </form>
            </li>`;
}

export default class EditFormView extends AbstractStatefulView {
  #handleDeleteClick = null;
  #datepicker = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  #offers = null;
  #destinations = null;
  #handleSubmit = null;
  #handleDiscardChanges = null;
  #isCreating = false;

  constructor({ point, offers, destinations, isCreating, onSubmit, onDiscardChanges, onDeleteClick }) {
    super();

    this.#offers = offers;
    this.#destinations = destinations;
    this.#isCreating = isCreating;
    this.#handleSubmit = onSubmit;
    this.#handleDiscardChanges = onDiscardChanges;
    this.#handleDeleteClick = onDeleteClick;

    this._setState(EditFormView.parsePointToState(point));
    this._restoreHandlers();
  }

  get template() {
    return createEditFormViewTemplate(this._state, this.#offers, this.#destinations, this.#isCreating);
  }

  _restoreHandlers() {
    if (this.element.querySelector('.event__rollup-btn')) {
      this.element.querySelector('.event__rollup-btn')
        .addEventListener('click', this.#handleDiscardChanges);
    }
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#changeTypeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#changeDestinationHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#changePriceHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formDeleteClickHandler);
    if (this.element.querySelector('.event__section--offers')) {
      this.element.querySelector('.event__section--offers')
        .addEventListener('change', this.#offerChangeHandler);
    }

    this.#setDatepicker();
  }

  removeElement() {
    super.removeElement();

    if (this.#datepicker) {
      this.#datepicker.destroy();
      this.#datepicker = null;
    }
  }

  reset(point) {
    this.updateElement(EditFormView.parsePointToState(point));
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#handleSubmit(EditFormView.parseStateToPoint(this._state));
  };

  #changeTypeHandler = (evt) => {
    if (evt.target.closest('input')) {
      this.updateElement({
        type: evt.target.value,
        offers: []
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

  #offerChangeHandler = (evt) => {
    const currentOffer = evt.target.dataset.offerId;

    if (evt.target.checked) {
      this._setState({
        offers: [...this._state.offers, currentOffer]
      });
    } else {
      this._setState({
        offers: this._state.offers.filter((offer) => offer !== currentOffer)
      });
    }
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

  #setDatepicker() {
    const [dateStartElement, dateEndElement] = this.element.querySelectorAll('.event__input--time');
    const commonConfig = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      locale: { firstDayOfWeek: 1 },
      'time_24hr': true
    };

    this.#datepickerStart = flatpickr(
      dateStartElement,
      {
        ...commonConfig,
        defaultDate: this.#isCreating ? '' : this._state.dateFrom,
        onChange: this.#changeStartDateHandler,
        maxDate: this._state.dateTo || ''
      }
    );

    this.#datepickerEnd = flatpickr(
      dateEndElement,
      {
        ...commonConfig,
        defaultDate: this.#isCreating ? '' : this._state.dateTo,
        onChange: this.#changeEndDateHandler,
        minDate: this._state.dateFrom || ''
      }
    );
  }

  #changeStartDateHandler = ([userDate]) => {
    const isoDate = convertDateToISO(userDate);
    this._setState({ dateFrom: isoDate });
    this.#datepickerEnd.set('minDate', isoDate);
  };

  #changeEndDateHandler = ([userDate]) => {
    const isoDate = convertDateToISO(userDate);
    this._setState({ dateTo: isoDate });
    this.#datepickerStart.set('maxDate', isoDate);
  };

  static parsePointToState(point) {
    return {
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };

    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;

    return point;
  }
}
