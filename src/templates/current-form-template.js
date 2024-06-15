import {TYPE_POINTS} from '../const.js';
import { getFullDate } from '../utils/utils.js';
import he from 'he';

function createCurrentFormTemplate (pointForm, townModelComponent) {
  const townModel = townModelComponent;
  const offers = pointForm.offers.offers;
  const destinations = [];
  townModel.towns.forEach((town) => {
    destinations.push(town.name);
  });
  pointForm.description = townModel.getTownDescByID(pointForm.destination);
  return `<li class="trip-events__item">
  <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${pointForm.type}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
              ${TYPE_POINTS.map((type) => `<div class="event__type-item">
              <input id="event-type-${type.toLowerCase()}-1" class="event__${type.toLowerCase()}-input  visually-hidden" type="radio" name="event-type" value="${type.toLowerCase()}">
              <label class="event__type-label  event__type-label--${type.toLowerCase()}" for="event-type-${type.toLowerCase()}-1">${type}</label>
            </div>`).join('')};
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${pointForm.type}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${townModel.getTownNameById(pointForm.destination)}" list="destination-list-1">
        <datalist id="destination-list-1">
          ${destinations.map((town) => `<option value="${he.encode(town)}"></option>`).join('')}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time event__dateFrom" id="event-start-time-1" type="text" name="event-start-time" value="${getFullDate(pointForm.dateFrom)}">
        &mdash;
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time event__dateTo" id="event-end-time-1" type="text" name="event-end-time" value="${getFullDate(pointForm.dateTo)}">
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${pointForm.basePrice}">
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit"
      ${pointForm.isDisabled ? 'disabled' : ''}>
        ${pointForm.isSaving ? 'Saving...' : 'Save'}
      </button>
      <button class="event__reset-btn" type="reset"
      ${pointForm.isDisabled ? 'disabled' : ''}>
        ${pointForm.isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>

    </header>
    ${offers?.length > 0 ? `<section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>

    <div class="event__available-offers">
    ${offers.map((offer) => `<div class="event__offer-selector">
    <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.title.toLowerCase()}-1" type="checkbox" name="event-offer-${offer.title.toLowerCase()}" ${offer.isChecked ? 'checked' : ''}>
    <label class="event__offer-label" for="event-offer-${offer.title.toLowerCase()}-1">
      <span class="event__offer-title">${offer.title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price ">${offer.price}</span>
    </label>
  </div>`).join('')}` : ''}
    <section class="event__details">
      ${pointForm.description ? `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${pointForm.description}</p>

      <div class="event__photos-container">
        <div class="event__photos-tape">
        ${pointForm.pictures.map((img) => `<img class="event__photo" src="${img.src}" alt="${img.description}">`).join('')}
        </div>
      </div>
    </section>` : ''}
    </section>
  </form>
</li>
`;
}

export {createCurrentFormTemplate};
