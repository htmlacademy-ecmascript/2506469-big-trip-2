import MainPresenter from './presenter/main-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import OffersModel from './model/offers-model.js';
import DestinationsModel from './model/destinations-model.js';
import NewPointButtonView from './view/new-point-button-view.js';
import { render } from './framework/render.js';
import PointsApiService from './points-api-service.js';

const AUTHORIZATION = 'Basic rS4gfS44wcl1sa2j';
const END_POINT = 'https://23.objects.htmlacademy.pro/big-trip';

const bodyElement = document.body;
const eventsContainerElement = bodyElement.querySelector('.trip-events');
const filtersContainerElement = bodyElement.querySelector('.trip-controls__filters');
const siteHeaderElement = bodyElement.querySelector('.trip-main');

const pointsApiService = new PointsApiService(END_POINT, AUTHORIZATION);

const pointsModel = new PointsModel({ pointsApiService });
const destinationsModel = new DestinationsModel({ pointsApiService });
const offersModel = new OffersModel({ pointsApiService });
const filterModel = new FilterModel();

//Передадим презентеру кроме контейнера модель точек через конструктор
const mainPresenter = new MainPresenter({
  container: eventsContainerElement,
  filtersContainer: filtersContainerElement,
  filterModel,
  pointsModel,
  offersModel,
  destinationsModel,
  onNewPointDestroy: handleNewPointFormClose,
});

const filterPresenter = new FilterPresenter({
  filterContainer: filtersContainerElement,
  filterModel: filterModel,
  pointsModel: pointsModel,
});

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewPointButtonClick
});

function handleNewPointFormClose() {
  newPointButtonComponent.element.disabled = false;
}

function handleNewPointButtonClick() {
  mainPresenter.createPoint();
  newPointButtonComponent.element.disabled = true;
}

filterPresenter.init();

// mainPresenter.init();
// Основная логика загрузки данных и инициализации

Promise.all([
  offersModel.init(),
  destinationsModel.init(),
  pointsModel.init()
]).then(() => {
  // console.log('Все данные загружены');
  mainPresenter.init(); // Теперь вызываем init() после загрузки данных
}).catch(() => {
  // console.error('Ошибка загрузки данных:', error);
}).finally(() => {
  render(newPointButtonComponent, siteHeaderElement);
});
