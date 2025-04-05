import dayjs from 'dayjs';

const humanizeDate = (date, dateFormat) => date ? dayjs(date).format(dateFormat) : '';

const convertDateToISO = (date) => dayjs(date).toISOString();

const isEscapeKey = (evt) => evt.key === 'Escape';

export { isEscapeKey, humanizeDate, convertDateToISO };
