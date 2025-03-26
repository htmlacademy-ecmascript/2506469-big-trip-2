import { remove, render, RenderPosition } from '../framework/render.js';
import EditFormView from '../view/edit-form-view.js';
import { nanoid } from 'nanoid';
import { UserAction, UpdateType } from '../const.js';
import { isEscapeKey } from '../utils/common.js';

export default class NewPointPresenter {
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;

  #pointListContainer = null;
  #handleDataChange = null;
  #handleDestroy = null;

  #editFormComponent = null;

  constructor({ pointListContainer, pointsModel, offersModel, destinationsModel, onDataChange, onDestroy }) {
    this.#pointListContainer = pointListContainer;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init() {
    if (this.#editFormComponent !== null) {
      return;
    }

    this.#editFormComponent = new EditFormView({
      point: this.#pointsModel.newPoint,
      destinations: this.#destinationsModel.destinations,
      offers: this.#offersModel.offers,
      onSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick
    });

    render(this.#editFormComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#editFormComponent === null) {
      return;
    }

    this.#handleDestroy();

    remove(this.#editFormComponent);
    this.#editFormComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #handleFormSubmit = (point) => {
    if (!point.destination) {
      this.destroy();
      return;
    }
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      // Пока нет сервера, который бы после сохранения
      // выдывал id точки, нужно позаботиться об этом самим
      { id: nanoid, ...point },
    );
    this.destroy();
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.destroy();
    }
  };
}
