import { render, replace } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import PointView from '../view/point-view.js';
import { isEscapeKey } from '../util.js';
import EditFormView from '../view/edit-form-view.js';

//Создадим класс, включающий в себя отрисовку остальных связанных компонентов
export default class PointsListPresenter {
  #container = null;
  #filtersContainer = null;
  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;

  #points = [];
  #offers = [];
  #destinations = [];

  #filtersView = new FiltersView();
  #sortingView = new SortingView();
  #pointsListViewComponent = new PointsListView();

  constructor({ container, filtersContainer, pointsModel, offersModel, destinationsModel }) {
    //Данные из main.js сохранили внутри класса
    this.#container = container;
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
  }

  init() {
    this.#points = [...this.#pointsModel.points];
    this.#offers = [...this.#offersModel.offers];
    this.#destinations = [...this.#destinationsModel.destinations];

    this.#renderPointsList();
  }

  #renderPointsList() {
    render(this.#filtersView, this.#filtersContainer);
    render(this.#sortingView, this.#container);
    render(this.#pointsListViewComponent, this.#container);

    for (let i = 0; i < this.#points.length; i++) {
      this.renderPoint(this.#points[i]);
    }
  }

  renderPoint(point) {

    const escKeydownHandler = (evt) => {
      if (isEscapeKey(evt)) {
        evt.preventDefault();
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeydownHandler);
      }
    };

    const pointViewComponent = new PointView({
      point,
      offers: this.#offers,
      destinations: this.#destinations,
      onClick: () => {
        replacePointToForm();
        document.addEventListener('keydown', escKeydownHandler);
      }
    });

    const editFormViewComponent = new EditFormView({
      point,
      offers: this.#offers,
      destinations: this.#destinations,
      onSubmit: () => {
        replaceFormToPoint();
        document.removeEventListener('keydown', escKeydownHandler);
      }
    });

    function replacePointToForm() {
      replace(editFormViewComponent, pointViewComponent);
    }

    function replaceFormToPoint() {
      replace(pointViewComponent, editFormViewComponent);
    }

    render(pointViewComponent, this.#pointsListViewComponent.element);
  }
}
