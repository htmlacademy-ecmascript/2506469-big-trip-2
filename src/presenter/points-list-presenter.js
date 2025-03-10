import { render } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import NoPointView from '../view/no-point-view.js';
import { generateFilter } from '../mock/filter.js';
import PointPresenter from './point-presenter.js';
import { updateItem } from '../utils/common.js';

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

  #filtersView = null;
  #sortingView = new SortingView();
  #pointsListComponent = new PointsListView();
  #noPointComponent = new NoPointView({ messageType: 'EVERYTHING' });

  #pointPresenters = new Map();

  constructor({ container, filtersContainer, pointsModel, offersModel, destinationsModel }) {
    //Данные из main.js сохранили внутри класса
    this.#container = container;
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;

    const filters = generateFilter((this.#pointsModel.points));
    this.#filtersView = new FiltersView({ filters });
  }

  init() {
    this.#points = [...this.#pointsModel.points];
    this.#offers = [...this.#offersModel.offers];
    this.#destinations = [...this.#destinationsModel.destinations];

    this.#renderComponents();
  }

  #renderComponents() {
    this.#renderFilter();
    this.#renderSort();
    this.#renderPointsList();
  }

  #handlePointChange = (updatePoint) => {
    this.#points = updateItem(this.#points, updatePoint);
    this.#pointPresenters.get(updatePoint.id).init(updatePoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderFilter() {
    render(this.#filtersView, this.#filtersContainer);
  }

  #renderSort() {
    render(this.#sortingView, this.#container);
  }

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destrоy());
    this.#pointPresenters.clear();
  }

  #renderPointsList() {
    render(this.#pointsListComponent, this.#container);


    if (this.#points.length === 0) {
      this.#renderEmptyPointsList();
    }

    for (let i = 0; i < this.#points.length; i++) {
      this.#renderPoint(this.#points[i]);
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointsListComponent.element,
      offers: this.#offers,
      destinations: this.#destinations,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange,
    });
    pointPresenter.init(point);
    //Сохраняем созданный экземпляр (this.#pointPresenters - экземпляр коллекции Map)
    // set передаем ключ (id) и сами данные экземпляр pointPresenter
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderEmptyPointsList() {
    render(this.#noPointComponent, this.#pointsListComponent.element);
  }

  #renderPoints(from, to) {
    this.#points.slice(from, to).forEach((point) => this.#renderPoint(point));
  }
}
