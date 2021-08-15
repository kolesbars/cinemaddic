import Abstarct from './abstract.js';

const createMenuTemplate = (filter) => {
  const {wathclist, hystory, favorites} = filter;
  return `<nav class="main-navigation">
    <div class="main-navigation__items">
      <a href="#all" class="main-navigation__item main-navigation__item--active">All movies</a>
      <a href="#watchlist" class="main-navigation__item">Watchlist <span class="main-navigation__item-count">${wathclist}</span></a>
      <a href="#history" class="main-navigation__item">History <span class="main-navigation__item-count">${hystory}</span></a>
      <a href="#favorites" class="main-navigation__item">Favorites <span class="main-navigation__item-count">${favorites}</span></a>
    </div>
    <a href="#stats" class="main-navigation__additional">Stats</a>
  </nav>`;
};

export default class SiteMenuView extends Abstarct {
  constructor(filter) {
    super();
    this._filter = filter;
  }

  getTemplate() {
    return createMenuTemplate(this._filter);
  }
}
