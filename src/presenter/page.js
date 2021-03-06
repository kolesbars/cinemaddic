import RatingView from '../view/rating-view.js';
import SortingView from '../view/sorting-view.js';
import SiteContent from '../view/site-content.js';
import FilmQuantityView from '../view/films-quantity-view.js';
import ShowMoreView from '../view/show-more-view.js';
import NoFilms from '../view/no-films.js';
import StatsButtonView from '../view/stats-button-view.js';
import Loading from '../view/loading.js';
import {renderElement, remove} from '../utils/render.js';
import {sortByDate, sortByRating} from '../utils/common.js';
import {filter} from '../utils/filters.js';
import Movie from './movie.js';
import {UpdateType, FilterType, UserAction} from '../const.js';
import {SortType} from '../const.js';

const FILM_COUNT_PER_STEP = 5;

export default class PagePresenter {
  constructor(headerContainer, mainContainer, footerContainer, moviesModel, filterModel, api) {
    this._headerContainer = headerContainer;
    this._mainContainer = mainContainer;
    this._footerContainer = footerContainer;
    this._moviesModel = moviesModel;
    this._filterModel = filterModel;
    this._renderedFilmCount = FILM_COUNT_PER_STEP;
    this._filmPresenters = new Map;
    this._filterType = FilterType.ALL;
    this._currentSortType = SortType.DEFAULT;
    this._isLoading = true;
    this._api = api;

    this._showMoreComponent = null;
    this._noFilmComponent = null;
    this._sortingComponent = null;

    this._contentComponent = new SiteContent();
    this._statsButtonComponent = new StatsButtonView();
    this._loadingComponent = new Loading();

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleShowMoreButtonClick = this._handleShowMoreButtonClick.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

  }

  init() {
    this._renderPage();
    this._moviesModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
  }

  destroy() {
    this._clearPage({resetRenderedFilmCount: true, resetSortType: true});

    this._moviesModel.removeObserver(this._handleModelEvent);
    this._filterModel.removeObserver(this._handleModelEvent);
  }

  _getFilms() {
    this._filterType = this._filterModel.getFilter();
    const films = this._moviesModel.getMovies();
    const filtredFilms = filter[this._filterType](films);

    switch (this._currentSortType) {
      case SortType.DATE:
        return filtredFilms.sort(sortByDate);
      case SortType.RATING:
        return filtredFilms.sort(sortByRating);
    }

    return filtredFilms;
  }

  _handleViewAction(userAction, updateType, update) {
    switch (userAction) {
      case UserAction.UPDATE_FILMS:
        this._api.updateFilms(update)
          .then((response) => {
            this._moviesModel.updateMovie(updateType, response);
          });
        break;
      case UserAction.UPDATE_COMMENTS:
        this._moviesModel.updateMovie(updateType, update);
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.CARD:
        this._filmPresenters.get(data.id).init(data, true);
        break;
      case UpdateType.FILMS:
        this._clearPage();
        this._renderPage();
        break;
      case UpdateType.POPUP:
        this._clearPage();
        this._renderPage();
        this._filmPresenters.get(data.id).init(data, true);
        break;
      case UpdateType.FILTER:
        this._clearPage({resetRenderedFilmCount: true, resetSortType: true});
        this._renderPage();
        break;
      case UpdateType.INIT:
        this._clearPage();
        this._isLoading = false;
        this._renderPage();
        this._renderFilmsQuntity();
        break;
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;
    this._clearPage({resetRenderedFilmCount: true});
    this._renderPage();
  }

  _renderSort() {
    if (this._sortingComponent !== null) {
      this._sortingComponent = null;
    }

    this._sortingComponent = new SortingView(this._currentSortType);
    this._sortingComponent.setSortTypeChangeHandler(this._handleSortTypeChange);

    renderElement(this._mainContainer, this._sortingComponent.getElement());
  }

  _renderRating() {
    this._ratingComponent = new RatingView(this._moviesModel.getMovies());
    renderElement( this._headerContainer, this._ratingComponent.getElement());
  }

  _renderContent() {
    renderElement(this._mainContainer, this._contentComponent.getElement());
  }

  _renderFilmsQuntity() {
    this._filmQuantityComponent = new FilmQuantityView(this._moviesModel.getMovies());
    renderElement(this._footerContainer, this._filmQuantityComponent.getElement());
  }

  _renderNoFilms() {
    this._noFilmComponent = new NoFilms(this._filterType);
    renderElement(this._contentComponent.getElement(), this._noFilmComponent.getElement());
  }

  _renderFilm(film, container) {
    const filmPresenter = new Movie(container, this._handleViewAction, this._hidePopup, this._api);
    filmPresenter.init(film);
    this._filmPresenters.set(film.id, filmPresenter);
  }

  _renderFilms(films) {
    films.forEach((film) => this._renderFilm(film, this._contentComponent));
  }

  _renderLoading() {
    renderElement(this._contentComponent.getElement(), this._loadingComponent.getElement());
  }

  _handleShowMoreButtonClick() {
    const filmCount = this._getFilms().length;
    const newRenderFilmCount = Math.min(filmCount, this._renderedFilmCount + FILM_COUNT_PER_STEP);
    const films = this._getFilms().slice(this._renderedFilmCount, newRenderFilmCount);

    this._renderFilms(films);
    this._renderedFilmCount = newRenderFilmCount;

    if (this._renderedFilmCount >= filmCount) {
      remove(this._showMoreComponent);
    }
  }

  _renderShowMoreButton() {
    if (this._showMoreComponent !== null) {
      this._showMoreComponent = null;
    }
    this._showMoreComponent = new ShowMoreView();
    const mainContentContainer = this._contentComponent.getElement().querySelector('.films-list');

    renderElement(mainContentContainer, this._showMoreComponent.getElement());

    this._showMoreComponent.setClickHandler(this._handleShowMoreButtonClick);
  }

  _clearPage({resetRenderedFilmCount = false, resetSortType = false} = {}) {
    const filmCount = this._getFilms().length;

    this._filmPresenters.forEach((presenter) => presenter.destroy());
    this._filmPresenters.clear;

    remove(this._showMoreComponent);
    remove(this._sortingComponent);
    remove(this._loadingComponent);
    remove(this._ratingComponent);

    if(this._noFilmComponent) {
      remove(this._noFilmComponent);
    }

    if (resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }

    if (resetRenderedFilmCount) {
      this._renderedFilmCount = FILM_COUNT_PER_STEP;
    } else {
      this._renderedFilmCount = Math.min(filmCount, this._renderedFilmCount);
    }
  }

  _hidePopup() {
    const popupElement = this._bodyElement.querySelector('.film-details');

    if (popupElement) {
      popupElement.remove();
    }
  }

  _renderPage() {
    if (this._isLoading){
      this._renderLoading();
    }

    const films = this._getFilms();
    const filmsCount = films.length;

    this._renderRating();
    this._renderSort();
    this._renderContent();

    if(filmsCount === 0 && !this._isLoading) {
      this._renderNoFilms();
      return;
    }

    this._renderFilms(films.slice(0, Math.min(filmsCount, this._renderedFilmCount)));

    if (this._renderedFilmCount < filmsCount) {
      this._renderShowMoreButton();
    }
  }
}

