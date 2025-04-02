const TIME_FORMAT = 'HH:mm';
const DATE_FORMAT = 'MMM D';
const DATE_TIME_FORMAT = 'DD/MM/YY HH:mm';

const POINT_TYPES =
  [
    'Taxi',
    'Bus',
    'Train',
    'Ship',
    'Drive',
    'Flight',
    'Check-in',
    'Sightseeing',
    'Restaurant'
  ];

const DESTINATIONS = [
  'Amsterdam',
  'Geneva',
  'Chamonix'
];

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

const SortType = {
  DAY:
  {
    text: 'day',
    isDisabled: false,
    isChecked: true
  },
  EVENT:
  {
    text: 'event',
    isDisabled: true,
    isChecked: false
  },
  TIME:
  {
    text: 'time',
    isDisabled: false,
    isChecked: false
  },
  PRICE:
  {
    text: 'price',
    isDisabled: false,
    isChecked: false
  },
  OFFER:
  {
    text: 'offer',
    isDisabled: true,
    isChecked: false
  }
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};


export { TIME_FORMAT, DATE_FORMAT, DATE_TIME_FORMAT, POINT_TYPES, DESTINATIONS, FilterType, SortType, UserAction, UpdateType };
