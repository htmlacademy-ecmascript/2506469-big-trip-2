import PointsListView from '../view/points-list-view.js';
import PointView from '../view/point-view.js';
import CreationFormView from '../view/creation-form-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render } from '../render.js';

//Создадим класс, включающий в себя отрисовку остальных связанных компонентов
export default class EventsListPresenter {
  pointsListViewComponent = new PointsListView();

  constructor({ container, pointsModel }) {
    this.container = container;
    this.pointsModel = pointsModel;
  }

  //Отрисовка компонентов
  init() {
    this.points = [...this.pointsModel.getPoints()];
    this.offers = [...this.pointsModel.getOffers()];
    this.destinations = [...this.pointsModel.getDestinations()];
    //Отрисовка формы редактирвоания в списке
    render(new EditFormView({ point: this.points[0], offers: this.offers, destinations: this.destinations }), this.pointsListViewComponent.getElement());
    render(new CreationFormView({ point: this.points[1], offers: this.offers, destinations: this.destinations }), this.pointsListViewComponent.getElement());
    render(this.pointsListViewComponent, this.container);
    //Отрисовка нескольких компнонентов точки маршрута по количеству данных в модели
    for (let i = 2; i < this.points.length; i++) {
      render(new PointView({ point: this.points[i], offers: this.offers, destinations: this.destinations }), this.pointsListViewComponent.getElement());
    }
  }
}
