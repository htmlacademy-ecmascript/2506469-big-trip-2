import { getRandomPoint } from '../mock/points.js';
import Observable from '../framework/observable.js';
import dayjs from 'dayjs';


const POINT_COUNT = 5;

//Модель точек маршрутов
export default class PointsModel extends Observable {
  //Запишем в свойство массив точек
  #points = Array.from({ length: POINT_COUNT }, getRandomPoint);

  //Получим данные из свойства points
  get points() {
    return this.#points;
  }

  get newPoint() {
    return {
      id: 'new',
      basePrice: 0,
      dateFrom: dayjs().toISOString(),
      dateTo: dayjs().toISOString(),
      destination: '',
      isFavorite: false,
      offers: [],
      type: 'flight',
    };
  }

  updatePoint(updateType, update) {
    //Ищем точку по уникальному id
    const index = this.#points.findIndex((point) => point.id === update.id);

    //Если не находим - выбрасываем ошибку
    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    //Начинаем выплнять обновление
    this.#points = [
      ...this.#points.slice(0, index),
      update,
      ...this.#points.slice(index + 1),
    ];

    //Уведомялем подписчиков о событиии
    this._notify(updateType, update);
  }

  //Добавляем в массив инфо по новой точке Передаем тип изменений и объект с изменениями
  addPoint(updateType, update) {
    this.#points = [
      update,
      ...this.#points,
    ];

    //Уведомялем подписчиков о событиии
    this._notify(updateType, update);
  }

  //Удлаляем эдемент
  deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];

    //Уведомлем о типе изменений
    this._notify(updateType);
  }
}
