import FiltersView from './view/filters-view.js';
import SortingView from './view/sorting-view.js';
import Presenter from './presenter/presenter.js';
import {render} from './render.js';

const bodyElement = document.body;

const filtersContainerElement = bodyElement.querySelector('.trip-controls__filters');
const sortingContainerElement = bodyElement.querySelector('.trip-events');

const presenter = new Presenter({container: sortingContainerElement});

//render вставляет в конейнер
render(new FiltersView(), filtersContainerElement);
render(new SortingView(), sortingContainerElement);


presenter.init();
