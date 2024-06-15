import { UPDATE_TYPE } from '../const.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { createCurrentFormTemplate } from '../templates/current-form-template.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class CurrentFormView extends AbstractStatefulView{
  #handleSubmit = null;
  #handleClose = null;
  #handleDelete = null;
  #pointModel = null;
  #datepickerTo = null;
  #datepickerFrom = null;
  #totalPrice = null;
  #unsavedChanges = null;

  constructor ({data, onSubmit, onClose, onDelete, pointModel, totalPrice}) {
    super();
    this.#pointModel = pointModel;
    this.#unsavedChanges = data;
    this._setState(CurrentFormView.parsePointToState(data));
    this.#handleSubmit = onSubmit;
    this.#handleClose = onClose;
    this.#handleDelete = onDelete;
    this.#totalPrice = totalPrice;
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#typeRouteToggleHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationToggleHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceToggleHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeHandler);

    const offersArr = this.element.querySelectorAll('.event__offer-selector');
    for (let i = 0; i < offersArr.length; i++) {
      offersArr[i].addEventListener('change', this.#offersToggleHandler);
    }
    this.#setDatepickerFrom();
    this.#setDatepickerTo();
  }

  get template() {
    return createCurrentFormTemplate(this._state, this.#pointModel.townModel);
  }

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
    return {...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false
    };
  }

  static parseStateToPoint(state) {
    const point = {...state};
    delete point.isDeleting;
    delete point.isSaving;
    delete point.isDisabled;
    return point;
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#typeRouteToggleHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationToggleHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceToggleHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeHandler);
    const offersArr = this.element.querySelectorAll('.event__offer-selector');
    for (let i = 0; i < offersArr.length; i++) {
      offersArr[i].addEventListener('change', this.#offersToggleHandler);
    }
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

  #submitHandler = (evt) => {
    evt.preventDefault();
    const tempID = this._state.destination;
    const tempOffersIDs = [];
    this._state.offers.offers.forEach((offer) => {
      if (offer.isChecked === true) {
        tempOffersIDs.push(offer.id);
      }
    });
    const newData = { ...this._state,
      destination: tempID,
      offers: tempOffersIDs
    };
    this.#handleSubmit(CurrentFormView.parseStateToPoint(newData));
  };

  #deleteHandler = (evt) => {
    evt.preventDefault();
    this.#handleDelete(CurrentFormView.parseStateToPoint(this._state));
  };

  #closeHandler = (evt) => {
    evt.preventDefault();
    this.#handleClose(this.#unsavedChanges);
  };

  #offersToggleHandler = (evt) => {
    evt.preventDefault();
    const name = evt.target.name.replace('event-offer-','');
    const result = name.charAt(0).toUpperCase() + name.slice(1);
    const newOffers = [...this._state.offers.offers];
    newOffers.map((offer) => {
      if (offer.title === result) {
        offer.isChecked = !offer.isChecked;
        if (offer.isChecked) {
          this.#totalPrice += offer.price;
        }
        else {
          this.#totalPrice -= offer.price;
        }
      }
    });
    const newData = { ...this._state,
      offers: {
        type: this._state.type,
        offers: newOffers
      }
    };
    this.updateElement(newData);
  };

  #typeRouteToggleHandler = (evt) => {
    evt.preventDefault();
    const newData = {
      ...this._state,
      type: evt.target.value,
      offers: this.#pointModel.offerModel.getOfferByType(this.#pointModel.offerModel.offers, evt.target.value),
      destination: this._state.destination};
    this.updateElement(newData);
  };

  #priceToggleHandler = (evt) => {
    evt.preventDefault();
    const newData = {... this._state, basePrice: Number(evt.target.value)};
    this.updateElement(newData);
  };

  #destinationToggleHandler = (evt) => {
    evt.preventDefault();
    const tempID = this.#pointModel.townModel.getIDByTownName(evt.target.value);
    const newData = {...this._state, destination: tempID,
      description: this.#pointModel.townModel.getTownDescByID(tempID),
      pictures: this.#pointModel.townModel.getPhotosByID(tempID)};
    this.updateElement(newData);
  };

  #dateFromChangeHandler = ([userDate]) => {
    const newData = {
      ...this._state,
      dateFrom: userDate,
    };
    if ('id' in this._state) {
      this.#pointModel.updatePoint(UPDATE_TYPE.PATCH, newData);
    }
    this.updateElement(newData);
  };

  #dateToChangeHandler = ([userDate]) => {
    const newData = {
      ...this._state,
      dateTo: userDate,
    };
    if ('id' in this._state) {
      this.#pointModel.updatePoint(UPDATE_TYPE.PATCH, newData);
    }
    this.updateElement(newData);
  };
}
