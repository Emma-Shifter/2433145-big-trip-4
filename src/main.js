import BoardPresenter from './presenter/board-presenter.js';
import PointModel from './model/point-model.js';
import TownModel from './model/town-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';
import NewPointButtonView from './view/new-point-button-view.js';
import { RenderPosition, render } from './framework/render.js';
import PointsApiService from '../src/points-api-service.js';
import OfferModel from './model/offer-model.js';

const AUTHORIZATION = 'Basic dxcf8yivo75869v3';
const END_POINT = 'https://21.objects.htmlacademy.pro/big-trip';

const tripInfoContainer = document.querySelector('.trip-events');
const addPointContainer = document.querySelector('.trip-main');
const townModel = new TownModel(new PointsApiService(END_POINT, AUTHORIZATION));
const offerModel = new OfferModel(new PointsApiService(END_POINT, AUTHORIZATION));
const pointModel = new PointModel({
  pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION),
  townModel: townModel,
  offerModel: offerModel
});
const filterModel = new FilterModel();

const boardPresenter = new BoardPresenter({
  container: tripInfoContainer,
  pointModel,
  filterModel,
  onNewPointDestroy: handleNewPointFormClose
});

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewPointButtonClick
});

function handleNewPointFormClose() {
  newPointButtonComponent.element.disabled = false;
}

function handleNewPointButtonClick() {
  boardPresenter.createPoint();
  newPointButtonComponent.element.disabled = true;
}

const filterPresenter = new FilterPresenter({
  filterContainer: document.querySelector('.trip-controls__filters'),
  filterModel,
  pointModel
});
filterPresenter.init();

render(newPointButtonComponent, addPointContainer, RenderPosition.BEFOREEND);
offerModel.init().finally(() => {
  townModel.init().finally(() => {
    pointModel.init().finally(() => {
      boardPresenter.init();
    });
  });
});
