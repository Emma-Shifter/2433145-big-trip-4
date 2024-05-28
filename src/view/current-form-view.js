import { UpdateType } from '../const.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { createCurrentFormTemplate } from '../templates/current-form-template.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

//лучше по имени переделывать отображение в форме, нежели чем да
export default class CurrentFormView extends AbstractStatefulView{
  #handleSubmit = null;
  #resetButtonsHandler = null;
  #offerModel = null;
  #pointModel = null;
  #datepickerTo = null;
  #datepickerFrom = null;

  constructor ({data, onSubmit, pointModel, resetButtons}) {
    super();
    this._setState(CurrentFormView.parsePointToState(data));
    this.#handleSubmit = onSubmit;
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#typeRouteToggleHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationToggleHandler);
    this.#setDatepickerFrom();
    this.#setDatepickerTo();
    this.#pointModel = pointModel;
    this.#resetButtonsHandler = resetButtons;
  }

  get template() {
    return createCurrentFormTemplate(this._state);
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    const newData = { ...this._state,
      destination: this.#pointModel.townModel.getIDByTownName(this._state.destination)
    };
    this.#pointModel.updatePoint(UpdateType.MINOR, newData);
    this.updateElement(newData);
    this.#resetButtonsHandler();
    this.#handleSubmit(CurrentFormView.parseStateToPoint(this._state));
  };

  #typeRouteToggleHandler = (evt) => {
    evt.preventDefault();
    const newData = {
      ...this._state,
      type: evt.target.value,
      offers: this.#pointModel.offerModel.getOfferByType(this.#pointModel.offerModel.offers, evt.target.value),
      destination: this.#pointModel.townModel.getIDByTownName(this._state.destination)};
    this.#pointModel.updatePoint(UpdateType.PATCH, newData);
    this.updateElement(newData);
    this.#resetButtonsHandler();
  };

  #destinationToggleHandler = (evt) => {
    evt.preventDefault();
    const tempID = this.#pointModel.townModel.getIDByTownName(evt.target.value);
    const newData = {...this._state, destination: tempID,
      description: this.#pointModel.townModel.getTownDescByID(tempID),
      pictures: this.#pointModel.townModel.getPhotosByID(tempID)};
    this.#pointModel.updatePoint(UpdateType.PATCH, newData);
    this.updateElement(newData);
    this.#resetButtonsHandler();
  };

  #dateFromChangeHandler = ([userDate]) => {
    const newData = { ...this._state, dateFrom: userDate, destination: this.#pointModel.townModel.getIDByTownName(this._state.destination)
    };
    this.#pointModel.updatePoint(UpdateType.PATCH, newData);
    this.updateElement(newData);
    this.#resetButtonsHandler();
  };

  #dateToChangeHandler = ([userDate]) => {
    const newData = { ...this._state, dateTo: userDate, destination: this.#pointModel.townModel.getIDByTownName(this._state.destination)
    };
    this.#pointModel.updatePoint(UpdateType.PATCH, newData);
    this.updateElement(newData);
    this.#resetButtonsHandler();
  };

  #setDatepickerFrom() {
    this.#datepickerFrom = flatpickr(
      this.element.querySelector('.event__dateFrom'),
      {
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
      },
    );
  }

  #setDatepickerTo() {
    this.#datepickerTo = flatpickr(
      this.element.querySelector('.event__dateTo'),
      {
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        onChange: this.#dateToChangeHandler,
      },
    );
  }

  static parsePointToState(point) {
    return {...point};
  }

  static parseStateToPoint(state) {
    const point = {...state};
    return point;
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#typeRouteToggleHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationToggleHandler);
    this.#setDatepickerFrom();
    this.#setDatepickerTo();
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerTo || this.#datepickerFrom) {
      this.#datepickerTo.destroy();
      this.#datepickerFrom.destroy();
      this.#datepickerTo = null;
      this.#datepickerFrom = null;
    }
  }
}
