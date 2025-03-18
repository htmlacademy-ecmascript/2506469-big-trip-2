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

const FilterMessage = {
  EVERYTHING: 'Click New Event to create your first point',
  PAST: 'There are no past events now',
  PRESENT: 'There are no present events now',
  FUTURE: 'There are no future events now',
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


export { TIME_FORMAT, DATE_FORMAT, DATE_TIME_FORMAT, POINT_TYPES, DESTINATIONS, FilterType, FilterMessage, SortType };
