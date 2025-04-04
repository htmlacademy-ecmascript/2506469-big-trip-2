import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const calculatesTravelTimeInMinutes = (dateFrom, dateTo) => dayjs(dateTo).diff(dateFrom, 'minute');

const formatsWithLeadingZero = (value) => String(value).padStart(2, '0');

const calculatesTravelTime = (dateFrom, dateTo) => {
  const date1 = dayjs(dateTo);
  const date2 = dayjs(dateFrom);

  const days = date1.diff(date2, 'day');
  const hours = date1.diff(date2.add(days, 'day'), 'hour');
  const minutes = date1.diff(date2.add(days, 'day').add(hours, 'hour'), 'minute');

  return [
    days ? `${formatsWithLeadingZero(days)}D` : '',
    hours || days ? `${formatsWithLeadingZero(hours)}H` : '00H',
    minutes || hours || days ? `${formatsWithLeadingZero(minutes)}M` : '00M'
  ].join(' ').trim();
};

const isPointsPassed = (date) => dayjs(date).isBefore(dayjs(), 'day');

const isPointsPlanned = (date) => dayjs(date).isAfter(dayjs(), 'day');

const isPointsCurrent = (startDate, endDate) => dayjs().isBetween(dayjs(startDate), dayjs(endDate), 'day', '[]');

const getWeightForNullDate = (dateA, dateB) => {
  if (dateA === null && dateB === null) {
    return 0;
  }
  if (dateA === null) {
    return 1;
  }
  if (dateB === null) {
    return -1;
  }
  return null;
};

const sortPointsByDate = (pointA, pointB) => getWeightForNullDate(pointA.dateFrom, pointB.dateFrom) ?? dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));

const sortPointsByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

const sortPointsByTime = (pointA, pointB) => calculatesTravelTimeInMinutes(pointB.dateFrom, pointB.dateTo) - calculatesTravelTimeInMinutes(pointA.dateFrom, pointA.dateTo);

const isDatesEqual = (dateA, dateB) => (dateA === null && dateB === null) || dayjs(dateA).isSame(dateB, 'D');

const getOffersByType = (type, offers) => offers.find((offer) => offer.type === type)?.offers || [];

const getPriceWithoutOffers = (points) => points.reduce((sum, price) => sum + price.basePrice, 0);

const getPointOffersPrice = (point, allOffers) => {
  const pointOffers = getOffersByType(point.type, allOffers);
  const includesPointOffers = pointOffers.filter((offers) => point.offers.includes(offers.id));
  return includesPointOffers.reduce((sum, currentPoint) => sum + currentPoint.price, 0);
};

const getDestination = (id, destinations) => destinations.find((destination) => destination.id === id);

const getCurrentDate = (date) => dayjs(date).format('DD MMM');

export { calculatesTravelTimeInMinutes, calculatesTravelTime, isPointsPassed, isPointsPlanned, isPointsCurrent, sortPointsByDate, sortPointsByPrice, sortPointsByTime, isDatesEqual, getPriceWithoutOffers, getPointOffersPrice, getDestination, getCurrentDate };
