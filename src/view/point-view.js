import AbstractView from '../framework/view/abstract-view.js';
import { humanizeTaskDueDate, calculatesTravelTime } from '../util.js';
import { TIME_FORMAT, DATE_FORMAT } from '../const.js';

function createPointOffersTemplate(pointOffers, point) {
  return pointOffers
    .map((offer) =>
      point.includes(offer.id)
        ? `<li class="event__offer">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </li>`
        : ''
    )
    .join('');
}

function createPointViewTemplate(point, offers, destinations) {

  const { basePrice, type, dateFrom, dateTo, isFavorite } = point;

  const pointDestination = destinations.find((destination) => destination.id === point.destination);

  const pointTypeOffer = offers.find((offer) => offer.type === point.type);
  const pointOffersTemplate = createPointOffersTemplate(pointTypeOffer.offers, point.offers);

  const date = humanizeTaskDueDate(dateTo, DATE_FORMAT);
  const startTime = humanizeTaskDueDate(dateFrom, TIME_FORMAT);
  const endTime = humanizeTaskDueDate(dateTo, TIME_FORMAT);
  const travelTime = calculatesTravelTime(dateFrom, dateTo);

  //Проверяем в избранном ли задача
  const favoriteClassName = isFavorite ? 'event__favorite-btn--active' : '';

  return `<li class="trip-events__item">
              <div class="event">
                <time class="event__date" datetime="2019-03-18">${date}</time>
                <div class="event__type">
                  <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
                </div>
                <h3 class="event__title">${type} ${pointDestination.name}</h3>
                <div class="event__schedule">
                  <p class="event__time">
                    <time class="event__start-time" datetime="${dateFrom}">${startTime}</time>
                    &mdash;
                    <time class="event__end-time" datetime="${dateTo}">${endTime}</time>
                  </p>
                  <p class="event__duration">${travelTime}М</p>
                </div>
                <p class="event__price">
                  &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
                </p>
                <h4 class="visually-hidden">Offers:</h4>
                <ul class="event__selected-offers">
                  <li class="event__offer">
                    <span class="event__offer-title">Order Uber</span>
                    &plus;&euro;&nbsp;
                    <span class="event__offer-price">20</span>
                  </li>
                </ul>
                <button class="event__favorite-btn ${favoriteClassName}" type="button">
                  <span class="visually-hidden">Add to favorite</span>
                  <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                    <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
                  </svg>
                </button>
                <button class="event__rollup-btn" type="button">
                  <span class="visually-hidden">Open event</span>
                </button>
              </div>
            </li>`;
}

export default class PointView extends AbstractView {
  #point = null;
  #offers = null;
  #destinations = null;
  #handleClick = null;

  constructor({ point, offers, destinations, onClick }) {
    super();//вызываем конструктор родительского класса AbstractView
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleClick = onClick;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#clickHandler);
  }

  #clickHandler = (evt) => {
    evt.preventDefault();
    this.#handleClick();
  };

  get template() {
    //Передаем аргументом объект с описанием точки
    return createPointViewTemplate(this.#point, this.#offers, this.#destinations);
  }
}
