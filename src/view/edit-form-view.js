import AbstractView from '../framework/view/abstract-view.js';
import { createFormOffersTemplate, humanizeTaskDueDate, createDestinationList, createEventTypeItem } from '../utils/point.js';
import { DATE_TIME_FORMAT } from '../const.js';

function createEditFormViewTemplate(point, offers, destinations) {
  const { type, basePrice, dateFrom, dateTo } = point;

  const editFormPointDestination = destinations.find((destination) => destination.id === point.destination);

  const pointTypeOffer = offers.find((offer) => offer.type === point.type);
  const editFormOffersTemplate = createFormOffersTemplate(pointTypeOffer.offers, point.offers);

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
                    <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${editFormPointDestination.name}" list="destination-list-1">
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
                    <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
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
                    ${editFormOffersTemplate}
                    </div>
                  </section>
                  <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${editFormPointDestination.description}</p>
                  </section>
                </section>
              </form>`;
}

export default class EditFormView extends AbstractView {
  #point = null;
  #offers = null;
  #destinations = null;
  #handleSubmit = null;

  constructor({ point, offers, destinations, onSubmit }) {
    super();//вызываем конструктор родительского класса AbstractView
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleSubmit = onSubmit;
    this.element.addEventListener('submit', this.#submitHandler);
    this.element.addEventListener('reset', this.#submitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#submitHandler);
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#handleSubmit(this.#point);
  };

  get template() {
    return createEditFormViewTemplate(this.#point, this.#offers, this.#destinations);
  }
}
