const UserAction = {
  UPDATE_FILMS: 'films',
  UPDATE_COMMENTS: 'comments',
};

const UpdateType = {
  CARD: 'CARD',
  FILMS: 'FILMS',
  POPUP: 'POPUP',
  FILTER: 'FILTER',
  INIT: 'INIT',
};

const FilterType = {
  ALL : 'all',
  WATCHLIST : 'watchlist',
  HISTORY : 'watched',
  FAVORITES : 'favorites',
};

const SortType = {
  DEFAULT: 'default',
  DATE: 'date',
  RATING: 'rating',
};

const StatsRanges = {
  ALL_TIME: 40000,
  TODAY: 1,
  WEEK: 6,
  MOUNTH: 30,
  YEAR: 365,
};

export {UserAction, UpdateType, FilterType, SortType, StatsRanges};
