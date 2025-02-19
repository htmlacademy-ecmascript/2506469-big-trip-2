import FiltersView from './view/filters-view.js';
import SortingView from './view/sorting-view.js';
import EventsListPresenter from './presenter/presenter.js';
import { render } from './render.js';
import EventsModel from './model/events-model.js';

const bodyElement = document.body;

const filtersContainerElement = bodyElement.querySelector('.trip-controls__filters');
const sortingContainerElement = bodyElement.querySelector('.trip-events');

//Создаем экземпляр класса модели точек
const pointsModel = new EventsModel();
//Передадим презентеру кроме контейнера модель точек через конструктор
const presenter = new EventsListPresenter({
  container: sortingContainerElement,
  pointsModel
});

//render компонентов в контейнеры
render(new FiltersView(), filtersContainerElement);
render(new SortingView(), sortingContainerElement);


presenter.init();
