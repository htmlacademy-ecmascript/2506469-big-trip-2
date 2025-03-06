import AbstractView from '../framework/view/abstract-view.js';
import { humanizeTaskDueDate, createFormOffersTemplate, createDestinationList, createEventTypeItem } from '../utils/point.js';
import { DATE_TIME_FORMAT } from '../const.js';


function createPictures(pictures) {
  return pictures
    .map((picture) =>
      `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
    ).join('');
}

function createCreationFormViewTemplate(point, offers, destinations) {
  const { type, dateFrom, dateTo, basePrice } = point;

  const pointTypeOffer = offers.find((offer) => offer.type === point.type);

  const creationFormOffersTemplate = createFormOffersTemplate(pointTypeOffer.offers, point.offers);
  const creationFormPointDestination = destinations.find((destination) => destination.id === point.destination);

  const destinationPictures = creationFormPointDestination
    ? createPictures(creationFormPointDestination.pictures)
    : '';

  const destinationListTemplate = createDestinationList(destinations);
  const eventTypeItemTemplateF = createEventTypeItem(offers);

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
                         ${eventTypeItemTemplateF}
                      </fieldset>
                    </div>
                  </div>
                  <div class="event__field-group  event__field-group--destination">
                    <label class="event__label  event__type-output" for="event-destination-1">
                    ${type}
                    </label>
                    <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${creationFormPointDestination.name}" list="destination-list-1">
                    <datalist id="destination-list-1">
                      <option value="Amsterdam"></option>
                      <option value="Geneva"></option>
                      <option value="Chamonix"></option>
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
                  <button class="event__reset-btn" type="reset">Cancel</button>
                </header>
                <section class="event__details">
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                    <div class="event__available-offers">
                    ${creationFormOffersTemplate}
                    </div>
                  </section>
                  <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${creationFormPointDestination.description}</p>
                    <div class="event__photos-container">
                      <div class="event__photos-tape">
                      ${destinationPictures}
                      </div>
                    </div>
                  </section>
                </section>
              </form>`;
}

export default class CreationFormView extends AbstractView {
  #point = null;
  #offers = null;
  #destinations = null;

  constructor({ point, offers, destinations }) {
    super();
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;
  }

  get template() {
    return createCreationFormViewTemplate(this.#point, this.#offers, this.#destinations);
  }
}
