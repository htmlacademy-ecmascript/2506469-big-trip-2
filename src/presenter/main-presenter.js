import { render, remove, RenderPosition } from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import NoPointView from '../view/no-point-view.js';
import LoadingView from '../view/loading-view.js';
import PointPresenter from './point-presenter.js';
import { SortType, UpdateType, UserAction, FilterType } from '../const.js';
import { sortPointByDate, sortPointByPrice, sortPointByTime } from '../utils/point.js';
import { filter } from '../utils/filter.js';
import NewPointPresenter from './new-point-presenter.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

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
  #loadingComponent = new LoadingView();
  #noPointComponent = null;

  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SortType.DAY.text;
  #filterType = FilterType.EVERYTHING;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

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

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#offersModel.addObserver(this.#handleModelEvent);
    this.#destinationsModel.addObserver(this.#handleModelEvent);

    this.#renderComponents();
    this.#handleModelEvent(UpdateType.INIT);
  }

  #renderComponents() {
    this.#renderSort();
    this.#renderPointsList();
  }

  createPoint() {
    this.#currentSortType = SortType.DAY.text;
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

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch (err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch (err) {
          this.#newPointPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch (err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();
  };

  //Будет реагировать на изменения модели
  #handleModelEvent = (updateType, data) => {
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
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderPointsList();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearBoard();
    this.#renderSort(); // Добавляем пересоздание сортировки
    this.#renderPointsList();
  };

  #renderSort() {
    if (this.#sortingComponent) {
      remove(this.#sortingComponent);
    }

    this.#sortingComponent = new SortingView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortingComponent, this.#container);
  }

  #renderPointsList() {
    render(this.#pointsListComponent, this.#container);
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (!this.#destinationsModel.destinations || !this.#offersModel.offers) {
      return;
    }


    const points = this.points; // Берем уже отсортированные точки

    if (points.length === 0) {
      this.#renderEmptyPointsList();
      return;
    }

    for (let i = 0; i < points.length; i++) {
      this.#renderPoint(points[i]);
    }
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#pointsListComponent.element, RenderPosition.AFTERBEGIN);
  }

  #clearBoard({ resetSortType = false } = {}) {

    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#loadingComponent);

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY.text;
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointsListComponent.element,
      offers: this.#offersModel.offers,
      destinations: this.#destinationsModel.destinations,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });
    pointPresenter.init(point);
    //Сохраняем созданный экземпляр (this.#pointPresenters - экземпляр коллекции Map)
    // set передаем ключ (id) и сами данные экземпляр pointPresenter
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderEmptyPointsList() {
    if (this.#noPointComponent) {
      return;
    }
    this.#noPointComponent = new NoPointView({
      filterType: this.#filterType
    });
    render(this.#noPointComponent, this.#pointsListComponent.element);
  }
}
