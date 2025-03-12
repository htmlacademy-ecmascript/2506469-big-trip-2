import { render } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import NoPointView from '../view/no-point-view.js';
import { generateFilter } from '../mock/filter.js';
import PointPresenter from './point-presenter.js';
import { updateItem } from '../utils/common.js';
import { SortType } from '../const.js';
import { sortPointByDate, sortPointByPrice, sortPointByTime } from '../utils/point.js';


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

  #filtersComponent = null;
  #sortingComponent = null;
  #pointsListComponent = new PointsListView();
  #noPointComponent = new NoPointView({ messageType: 'EVERYTHING' });

  #pointPresenters = new Map();//при замене на Set ошибка, что нет метода set
  #currentSortType = SortType.DAY;
  #sourcedPoints = [];

  constructor({ container, filtersContainer, pointsModel, offersModel, destinationsModel }) {
    //Данные из main.js сохранили внутри класса
    this.#container = container;
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;

    const filters = generateFilter((this.#pointsModel.points));

    this.#filtersComponent = new FiltersView({ filters });
  }

  init() {
    this.#points = [...this.#pointsModel.points];
    this.#offers = [...this.#offersModel.offers];
    this.#destinations = [...this.#destinationsModel.destinations];

    this.#sourcedPoints = [...this.#pointsModel.points];

    this.#renderComponents();
  }

  #renderComponents() {
    this.#renderFilter();
    this.#renderSort();
    this.#renderPointsList();
  }

  #handlePointChange = (updatedPoint) => {
    this.#points = updateItem(this.#points, updatedPoint);
    this.#sourcedPoints = updateItem(this.#sourcedPoints, updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #sortPoints(sortType) {
    switch (sortType) {
      case SortType.DAY.text:
        this.#points.sort(sortPointByDate);
        break;
      case SortType.TIME.text:
        this.#points.sort(sortPointByTime);
        break;
      case SortType.PRICE.text:
        this.#points.sort(sortPointByPrice);
        break;
      // default:
      // Запишем в points исходный массив
      // this.#points = [...this.#sourcedPoints];
    }
    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    //Сортируем задачи
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoints(sortType);
    //Очищаем список
    this.#clearPointsList();
    //Рендерим список заново;
    this.#renderPointsList();
  };

  #renderSort() {
    this.#sortingComponent = new SortingView({
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortingComponent, this.#container);
  }

  #renderFilter() {
    render(this.#filtersComponent, this.#filtersContainer);
  }

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
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
}
