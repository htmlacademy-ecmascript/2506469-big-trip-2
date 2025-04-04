import { remove, render, replace } from '../framework/render.js';
import PointView from '../view/point-view.js';
import { isEscapeKey } from '../utils/common.js';
import EditFormView from '../view/edit-form-view.js';
import { UpdateType, UserAction } from '../const.js';
import { isDatesEqual } from '../utils/point.js';
import { Mode } from '../const.js';

export default class PointPresenter {
  #pointListContainer = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #pointComponent = null;
  #editFormComponent = null;

  #point = null;
  #mode = Mode.VIEW;

  #offers = [];
  #destinations = [];

  constructor({ pointListContainer, offers, destinations, onDataChange, onModeChange }) {
    this.#pointListContainer = pointListContainer;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevEditFormComponent = this.#editFormComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destinations,
      onClick: () => {
        this.#replaceViewToForm();
      },
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#editFormComponent = new EditFormView({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destinations,
      onSubmit: this.#handleSubmit,
      onDiscardChanges: this.#handleDiscardChanges,
      onDeleteClick: this.#handleDeleteClick
    });

    if (prevPointComponent === null || prevEditFormComponent === null) {
      render(this.#pointComponent, this.#pointListContainer);
      return;
    }

    if (this.#mode === Mode.VIEW) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointComponent, prevEditFormComponent);
      this.#mode = Mode.VIEW;
    }

    remove(prevPointComponent);
    remove(prevEditFormComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#editFormComponent);
  }

  resetView() {
    if (this.#mode !== Mode.VIEW) {
      this.#editFormComponent.reset(this.#point);
      this.#replaceFormToView();
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#editFormComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#editFormComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.VIEW) {
      this.#pointComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#editFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#editFormComponent.shake(resetFormState);
  }

  #replaceViewToForm() {
    replace(this.#editFormComponent, this.#pointComponent);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
    document.addEventListener('keydown', this.#escKeydownHandler);
  }

  #replaceFormToView() {
    replace(this.#pointComponent, this.#editFormComponent);
    this.#mode = Mode.VIEW;
    document.removeEventListener('keydown', this.#escKeydownHandler);
  }

  #handleSubmit = (update) => {
    const isMinorUpdate =
      this.#point.basePrice !== update.basePrice ||
      !isDatesEqual(this.#point.dateFrom, update.dateFrom) ||
      !isDatesEqual(this.#point.dateTo, update.dateTo);

    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
      update,
    );
  };

  #handleDeleteClick = (point) => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  #handleDiscardChanges = () => {
    this.#editFormComponent.reset(this.#point);
    this.#replaceFormToView();
  };

  #escKeydownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#handleDiscardChanges();
      document.removeEventListener('keydown', this.#escKeydownHandler);
    }
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      { ...this.#point, isFavorite: !this.#point.isFavorite });
  };
}
