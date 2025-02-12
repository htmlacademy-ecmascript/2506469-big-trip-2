import PointsListView from '../view/points-list-view.js';
import PointView from '../view/point-view.js';
import CreationFormView from '../view/creation-form-view.js';
import EditFormView from '../view/edit-form-view.js';
import {render} from '../render.js';

const POINTS_COUNT = 3;
//Создадим класс, включающий в себя отрисовку остальных связанных компонентов
export default class Presenter {
  pointsListViewComponent = new PointsListView();
  pointViewComponent = new PointView();
  creationFormViewComponent = new CreationFormView();
  editFormViewComponent = new EditFormView();

  constructor({container}) {
    this.container = container;
  }

  //Отрисовка компонентов
  init() {
    //Отрисовка формы редактирвоания в списке
    render(this.editFormViewComponent, this.pointsListViewComponent.getElement());
    render(this.creationFormViewComponent, this.pointsListViewComponent.getElement());
    render(this.pointsListViewComponent, this.container);
    //Отрисовка нескольких компнонентов точки маршрута
    for (let i = 0; i < POINTS_COUNT; i++) {
      render(new PointView(), this.pointsListViewComponent.getElement());
    }
  }
}
