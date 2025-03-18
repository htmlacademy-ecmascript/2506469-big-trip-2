import { remove, render, replace } from '../framework/render.js';
import PointView from '../view/point-view.js';
import { isEscapeKey } from '../utils/common.js';
import EditFormView from '../view/edit-form-view.js';

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
      replace(this.#editFormComponent, prevEditFormComponent);
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

  //Бывшие функции метода renderPoint стали полноценными функциями
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
    this.#handleDataChange({ ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #handleSubmit = (point) => {
    this.#handleDataChange(point);
    this.#replaceFormToView();
  };

  #escKeydownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#replaceFormToView();
      document.removeEventListener('keydown', this.#escKeydownHandler);
    }
  };
}
