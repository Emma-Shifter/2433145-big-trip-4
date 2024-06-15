import AbstractView from '../framework/view/abstract-view.js';
import { createSortItemTemplate } from '../templates/sort-item-template.js';

export default class SortItemView extends AbstractView{
  #sort = null;
  #handleSortTypeChange = null;

  constructor ({sort, onSortTypeChange}) {
    super();
    this.#sort = sort;
    this.#handleSortTypeChange = onSortTypeChange;
    this.element.addEventListener('click', this.#sortTypeChange);
  }

  get template() {
    return createSortItemTemplate(this.#sort);
  }

  #sortTypeChange = (evt) => {
    if (evt.target.tagName === 'DIV') {
      return;
    }

    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };
}
