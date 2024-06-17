import Observable from '../framework/observable.js';
import {UPDATE_TYPE} from '../const.js';
import { getDateDiff } from '../utils/utils.js';
import dayjs from 'dayjs';

export default class PointModel extends Observable{
  townModel = null;
  offerModel = null;
  #points = null;
  #pointsApiService = null;

  constructor ({pointsApiService, townModel, offerModel}) {
    super();
    this.#pointsApiService = pointsApiService;
    this.offerModel = offerModel;
    this.townModel = townModel;
    this.#points = [];
  }

  get points() {
    return this.#points;
  }

  async init() {
    try {
      const points = await this.#pointsApiService.points;
      this.#points = points.map(this.#adaptToClient);
    } catch(err) {
      this.#points = [];
    }
    this._notify(UPDATE_TYPE.INIT);
  }

  countFilteredPoints() {
    const filterElementsCounts = {
      present: 0,
      past: 0,
      future: 0
    };
    const currentDate = dayjs();
    this.#points.forEach((point) => {
      if (point.dateTo < currentDate) {
        filterElementsCounts.past += 1;
      } else if (point.dateFrom < currentDate) {
        filterElementsCounts.present += 1;
      } else {
        filterElementsCounts.future += 1;
      }
    });
    return filterElementsCounts;
  }

  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);
      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1)
      ];
      this._notify(updateType, updatedPoint);
    }
    catch (err) {
      throw new Error('Can\'t update unexisting point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#pointsApiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);
      this.#points = [newPoint, ...this.#points];
      this._notify(updateType, newPoint);
    } catch (err) {
      throw new Error('Can\'t add point');
    }
  }

  async deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    try {
      await this.#pointsApiService.deletePoint(update);
      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1)
      ];
      this._notify(updateType);
    } catch (err) {
      throw new Error('Can\'t delete unexisting point');
    }
  }

  #adaptToClient(point) {
    const adaptedPoint = {...point,
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
      isFavorite: point['is_favorite'],
      basePrice: point['base_price'],
      duration: getDateDiff(point['date_from'], point['date_to']),
    };

    delete adaptedPoint['date_to'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['is_favorite'];
    delete adaptedPoint['base_price'];

    return adaptedPoint;
  }
}
