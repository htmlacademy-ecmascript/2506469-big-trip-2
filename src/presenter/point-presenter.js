import { remove, render, replace } from '../framework/render.js';
import PointView from '../view/point-view.js';
import { isEscapeKey } from '../utils/common.js';
import EditFormView from '../view/edit-form-view.js';
import { UpdateType, UserAction } from '../const.js';
import { isDatesEqual } from '../utils/point.js';

const Mode = {
  VIEW: 'VIEW',
  EDITING: 'EDITING',
};

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

  //Присвоим контейнер для точек в конструктор офферы и направления и их будем передавать через род-й перезентер
  constructor({ pointListContainer, offers, destinations, onDataChange, onModeChange }) {
    this.#pointListContainer = pointListContainer;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  //Заведем метод инициализации презенетра
  init(point) {
    this.#point = point;

    //Создадим переменные для экземпляров вью (там будет либо null либо соотв-й экземпляр))
    const prevPointComponent = this.#pointComponent;
    const prevEditFormComponent = this.#editFormComponent;

    //Создадим экземпляры наших вью
    this.#pointComponent = new PointView({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destinations,
      onClick: () => {
        this.#replaceViewToForm();
        document.addEventListener('keydown', this.#escKeydownHandler);
      },
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#editFormComponent = new EditFormView({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destinations,
      onSubmit: this.#handleSubmit,
      onDeleteClick: this.#handleDeleteClick
    });

    //Проверяем не равны ли экзмепляры null
    if (prevPointComponent === null || prevEditFormComponent === null) {
      //Отрендерим вью
      render(this.#pointComponent, this.#pointListContainer);
      return;
    }

    //Проверям установлен ли режим просмотра
    if (this.#mode === Mode.VIEW) {
      //Заменяем старый компонент на новый
      replace(this.#pointComponent, prevPointComponent);
    }

    //Проверям установлен ли режим редктирования
    if (this.#mode === Mode.EDITING) {
      replace(this.#pointComponent, prevEditFormComponent);
      this.#mode = Mode.DEFAULT;
    }

    //Удаляем старые компоненты
    remove(prevPointComponent);
    remove(prevEditFormComponent);
  }

  //Метод для удаления компонентов точки и формы
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
    if (this.#mode === Mode.DEFAULT) {
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
    document.addEventListener('keydown', this.#escKeydownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToView() {
    replace(this.#pointComponent, this.#editFormComponent);
    document.removeEventListener('keydown', this.#escKeydownHandler);
    this.#mode = Mode.VIEW;
  }

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      { ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #handleSubmit = (update) => {
    // Проверяем, поменялись ли в задаче данные, которые попадают под фильтрацию,
    // а значит требуют перерисовки списка - если таких нет, это PATCH-обновление
    const isMinorUpdate =
      this.#point.basePrice !== update.basePrice ||
      !isDatesEqual(this.#point.dateFrom, update.dateFrom) ||
      !isDatesEqual(this.#point.dateTo, update.dateTo);

    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
      update,
    );

    this.#replaceFormToView();
  };

  #handleDeleteClick = (point) => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  #escKeydownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#replaceFormToView();
      document.removeEventListener('keydown', this.#escKeydownHandler);
    }
  };
}
