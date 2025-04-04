import { remove, render, RenderPosition } from '../framework/render.js';
import EditFormView from '../view/edit-form-view.js';
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
      isCreating: true,
      onSubmit: this.#handleFormSubmit,
      onDiscardChanges: this.#handleDeleteClick,
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

  setSaving() {
    this.#editFormComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    if (!this.#editFormComponent) {
      return; // Прекратить выполнение, если форма уже удалена
    }
    const resetFormState = () => {
      if (!this.#editFormComponent) {
        return; // Повторная проверка, если форма удалилась за время анимации
      }
      this.#editFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#editFormComponent.shake(resetFormState);
  }

  #handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point,
    );
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
