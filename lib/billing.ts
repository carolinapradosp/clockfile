import { HOURLY_RATE } from './constants';
import { durationToMinutes } from './time';

export const calculateAmount = (duration: string): number => {
    const minutes = durationToMinutes(duration);

    return Number(((minutes / 60) * HOURLY_RATE).toFixed(2));
};
