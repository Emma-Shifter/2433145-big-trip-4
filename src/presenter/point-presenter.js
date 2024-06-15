import RoutePointView from '../view/route-point-view.js';
import CurrentFormView from '../view/current-form-view.js';
import { remove, render, replace } from '../framework/render.js';
import {isEscapeButton} from '../utils/utils.js';
import { USER_ACTION, UPDATE_TYPE } from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING'
};

export default class PointPresenter {
  #pointsListView = null;
  #handlePointChange = null;
  #handleModeChange = null;
  #point = null;
  #mode = Mode.DEFAULT;
  #pointComponent = null;
  #pointFormComponent = null;
  #totalPrice = null;
  #pointModel = null;

  constructor (pointListContainer, onDataChange, onModeChange, pointModel, totalPrice) {
    this.#pointsListView = pointListContainer;
    this.#handlePointChange = onDataChange;
    this.#handleModeChange = onModeChange;
    this.#pointModel = pointModel;
    this.#totalPrice = totalPrice;
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevFormComponent = this.#pointFormComponent;
    this.#addInfo(this.#point);
    this.#pointComponent = new RoutePointView({
      data: this.#point,
      onFavouriteClick: this.#handleFavouriteClick,
      onOpenClick: this.#handleOpenClick,
      pointModel: this.#pointModel
    });
    this.#pointFormComponent = new CurrentFormView({
      data: this.#point,
      onSubmit: this.#handleFormSubmit,
      onClose: this.#handleCloseClick,
      onDelete: this.#handleDeleteClick,
      pointModel: this.#pointModel,
      resetButtons: this.resetButtons,
      totalPrice: this.#totalPrice
    });

    if (prevPointComponent === null || prevFormComponent === null) {
      render(this.#pointComponent, this.#pointsListView);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointComponent, prevFormComponent);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevFormComponent);
    remove(prevPointComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointFormComponent);
  }

  resetView(point) {
    if (this.#mode !== Mode.DEFAULT) {
      this.#pointFormComponent.updateElement(CurrentFormView.parsePointToState(point));
      this.#replacePointToForm();
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#pointFormComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#pointFormComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#pointComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#pointFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#pointFormComponent.shake(resetFormState);
  }

  #addInfo(point) {
    const checkedOffers = point.offers;
    this.#point = {
      ...point,
      pictures: this.#pointModel.townModel.getPhotosByID(point.destination),
      destination: point.destination,
      offers: this.#pointModel.offerModel.getOfferByType(this.#pointModel.offerModel.offers, point.type),
    };
    this.#point.offers.offers?.forEach((offer) => {
      if(!(checkedOffers.includes(offer.id))){
        offer.isChecked = false;
      }
      else {
        offer.isChecked = true;
      }
    });
  }

  #replacePointToForm() {
    replace(this.#pointComponent, this.#pointFormComponent);
    this.#mode = Mode.DEFAULT;
  }

  #replaceFormToPoint() {
    replace(this.#pointFormComponent, this.#pointComponent);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #handleFavouriteClick = (update) => {
    this.#handlePointChange(
      USER_ACTION.UPDATE_POINT,
      UPDATE_TYPE.MINOR,
      update);
  };

  #handleFormSubmit = (update) => {
    this.#handlePointChange(
      USER_ACTION.UPDATE_POINT,
      UPDATE_TYPE.MINOR,
      update
    );
  };

  #handleDeleteClick = (point) => {
    this.#handlePointChange(
      USER_ACTION.DELETE_POINT,
      UPDATE_TYPE.MINOR,
      point
    );
  };

  #handleOpenClick = () => {
    this.#replaceFormToPoint();
    document.removeEventListener('keydown', this.#escKeyDownButtonHandler);
  };

  #handleCloseClick = (point) => {
    this.resetView(point);
    this.#replacePointToForm();
    document.removeEventListener('keydown', this.#escKeyDownButtonHandler);
  };

  #escKeyDownButtonHandler = (evt) => {
    if (isEscapeButton(evt)) {
      this.#replacePointToForm();
      document.removeEventListener('keydown', this.#escKeyDownButtonHandler);
    }
  };
}
