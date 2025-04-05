import { render, remove, RenderPosition } from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import SortingView from '../view/sorting-view.js';
import PointsListView from '../view/points-list-view.js';
import NoPointView from '../view/no-point-view.js';
import LoadingView from '../view/loading-view.js';
import PointPresenter from './point-presenter.js';
import { SortType, UpdateType, UserAction, FilterType } from '../const.js';
import { sortPointsByDate, sortPointsByPrice, sortPointsByTime } from '../utils/point.js';
import { filter } from '../utils/filter.js';
import NewPointPresenter from './new-point-presenter.js';
import ErrorView from '../view/error-view.js';
import TripInfoView from '../view/trip-info-view.js';
import { TimeLimit } from '../const.js';

export default class MainPresenter {
  #container = null;
  #tripInfoContainer = null;
  #pointsModel = null;
  #offersModel = null;
  #filterModel = null;
  #destinationsModel = null;

  #sortingComponent = null;
  #pointsListComponent = new PointsListView();
  #loadingComponent = new LoadingView();
  #errorComponent = new ErrorView();
  #noPointComponent = null;
  #tripInfoComponent = null;

  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SortType.DAY.text;
  #filterType = FilterType.EVERYTHING;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  #onNewPointDestroy = null;

  constructor({ container, pointsModel, offersModel, destinationsModel, filterModel, onNewPointDestroy, tripInfoContainer }) {
    this.#container = container;
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#filterModel = filterModel;
    this.#tripInfoContainer = tripInfoContainer;
    this.#onNewPointDestroy = onNewPointDestroy;

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#pointsListComponent.element,
      pointsModel: this.#pointsModel,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#destroyPoint
    });

    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.DAY.text:
        return filteredPoints.sort(sortPointsByDate);
      case SortType.TIME.text:
        return filteredPoints.sort(sortPointsByTime);
      case SortType.PRICE.text:
        return filteredPoints.sort(sortPointsByPrice);
      default:
        return filteredPoints.sort(sortPointsByDate);
    }
  }

  init() {
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#renderBoard();
    this.#handleModelEvent(UpdateType.INIT);
  }

  createPoint() {
    this.#currentSortType = SortType.DAY.text;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter.init();


    remove(this.#noPointComponent);
  }

  #renderTripInfo = () => {
    this.#tripInfoComponent = new TripInfoView({
      points: this.#pointsModel.points,
      destinations: this.#destinationsModel.destinations,
      offers: this.#offersModel.offers,
    });
    render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
  };

  #renderSort() {
    this.#sortingComponent = new SortingView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortingComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #renderBoard() {
    render(this.#pointsListComponent, this.#container);

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.points.includes('error')
      || !this.#destinationsModel.destinations.length
      || !this.#offersModel.offers.length) {
      this.#renderError();

      return;
    }

    if (!this.points.length) {
      this.#renderEmptyPointsList();
      return;
    }

    this.#renderPoints();
  }

  #renderPoints() {
    if (!this.#destinationsModel.destinations.length || !this.#offersModel.offers.length) {
      return;
    }
    this.#renderTripInfo();
    this.#renderSort();

    this.points.forEach((point) => {
      this.#renderPoint(point);
    });
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
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#pointsListComponent.element, RenderPosition.AFTERBEGIN);
  }

  #renderError() {
    render(this.#errorComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #renderEmptyPointsList() {
    this.#noPointComponent = new NoPointView({
      filterType: this.#filterType
    });
    render(this.#noPointComponent, this.#pointsListComponent.element);
  }

  #destroyPoint = () => {
    this.#onNewPointDestroy();

    if (!this.points.length) {
      this.#renderEmptyPointsList();
    }
  };

  #clearBoard({ resetSortType = false } = {}) {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#tripInfoComponent);
    remove(this.#sortingComponent);
    remove(this.#loadingComponent);
    remove(this.#errorComponent);

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY.text;
    }
  }


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

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#clearBoard();
        this.#isLoading = false;
        remove(this.#loadingComponent);
        remove(this.#errorComponent);
        this.#renderBoard();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearBoard();
    this.#renderPoints();
  };
}
