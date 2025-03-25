import { render, remove } from '../framework/render.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import NoPointView from '../view/no-point-view.js';
import PointPresenter from './point-presenter.js';
import { SortType, UpdateType, UserAction, FilterType } from '../const.js';
import { sortPointByDate, sortPointByPrice, sortPointByTime } from '../utils/point.js';
import { filter } from '../utils/filter.js';
import NewPointPresenter from './new-point-presenter.js';

//Создадим класс, включающий в себя отрисовку остальных связанных компонентов
export default class MainPresenter {
  #container = null;
  #filtersContainer = null;
  #pointsModel = null;
  #offersModel = null;
  #filterModel = null;
  #destinationsModel = null;

  #offers = [];
  #destinations = [];

  #filtersComponent = null;
  #sortingComponent = null;
  #pointsListComponent = new PointsListView();
  #noPointComponent = null;

  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SortType.DAY;
  #filterType = FilterType.EVERYTHING;

  constructor({ container, filtersContainer, pointsModel, offersModel, destinationsModel, filterModel, onNewPointDestroy }) {
    //Данные из main.js сохранили внутри класса
    this.#container = container;
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#filterModel = filterModel;

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#pointsListComponent.element,
      pointsModel: this.#pointsModel,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewPointDestroy
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {

    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.DAY.text:
        return filteredPoints.sort(sortPointByDate);
      case SortType.TIME.text:
        return filteredPoints.sort(sortPointByTime);
      case SortType.PRICE.text:
        return filteredPoints.sort(sortPointByPrice);
    }

    return filteredPoints;
  }

    init() {
      this.#offers = [...this.#offersModel.offers];
      this.#destinations = [...this.#destinationsModel.destinations];

      this.#renderComponents();
    }

    #renderComponents() {
      // this.#renderFilter();
      this.#renderSort();
      this.#renderPointsList();
    }

    createPoint() {
      this.#currentSortType = SortType.DAY;
      this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
      this.#newPointPresenter.init();
    }

    #handlePointChange = (updatedPoint) => {
      //Здесь будем вызывать обновление модели
      this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
    };

    #handleModeChange = () => {
      this.#newPointPresenter.destroy();
      this.#pointPresenters.forEach((presenter) => presenter.resetView());
    };

    #handleViewAction = (actionType, updateType, update) => {
      switch (actionType) {
        case UserAction.UPDATE_POINT:
          this.#pointsModel.updatePoint(updateType, update);
          break;
        case UserAction.ADD_POINT:
          this.#pointsModel.addPoint(updateType, update);
          break;
        case UserAction.DELETE_POINT:
          this.#pointsModel.deletePoint(updateType, update);
          break;
      }
    };

    //Будет реагировать на изменения модели
    #handleModelEvent = (updateType, data) => {
      // В зависимости от типа изменений решаем, что делать:
      switch (updateType) {
        case UpdateType.PATCH:
          // - обновить часть списка
          this.#pointPresenters.get(data.id).init(data);
          break;
        case UpdateType.MINOR:
          // - обновить список
          this.#clearBoard();
          this.#renderPointsList();
          break;
        case UpdateType.MAJOR:
          // - обновить всю доску (например, при переключении фильтра)
          this.#clearBoard({ resetSortType: true });
          this.#renderPointsList();
          break;
      }
    };

    #handleSortTypeChange = (sortType) => {
      //Сортируем задачи
      if (this.#currentSortType === sortType) {
        return;
      }

      this.#currentSortType = sortType;

      this.#clearBoard();
      this.#renderSort(); // Рендерим сортировку, если она не была отрисована
      this.#renderPointsList();
    };

    #renderSort() {
      if (!this.#sortingComponent) { // Проверяем, если сортировка уже отрисована
        this.#sortingComponent = new SortingView({
          currentSortType: this.#currentSortType,
          onSortTypeChange: this.#handleSortTypeChange
        });
        render(this.#sortingComponent, this.#container);
      }
    }

    #renderPointsList() {
      render(this.#pointsListComponent, this.#container);


      const points = this.points; // Берем уже отсортированные точки

      if (points.length === 0) {
        this.#renderEmptyPointsList();
      }

      for (let i = 0; i < this.points.length; i++) {
        this.#renderPoint(this.points[i]);
      }
    }

    #clearBoard({ resetSortType = false } = {}) {

      this.#newPointPresenter.destroy();
      this.#pointPresenters.forEach((presenter) => presenter.destroy());
      this.#pointPresenters.clear();

      if (this.#noPointComponent) {
        remove(this.#noPointComponent);
      }

      if (resetSortType) {
        this.#currentSortType = SortType.DAY;
      }
    }

    #renderPoint(point) {
      const pointPresenter = new PointPresenter({
        pointListContainer: this.#pointsListComponent.element,
        offers: this.#offers,
        destinations: this.#destinations,
        onDataChange: this.#handleViewAction,
        onModeChange: this.#handleModeChange,
      });
      pointPresenter.init(point);
      //Сохраняем созданный экземпляр (this.#pointPresenters - экземпляр коллекции Map)
      // set передаем ключ (id) и сами данные экземпляр pointPresenter
      this.#pointPresenters.set(point.id, pointPresenter);
    }

    #renderEmptyPointsList() {
      this.#noPointComponent = new NoPointView({
        filterType: this.#filterType
      });
      render(this.#noPointComponent, this.#pointsListComponent.element);
    }
  }
