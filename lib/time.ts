import { HOURLY_RATE } from "./constants";

export const durationToMinutes = (
    duration: string
): number => {
    if (!duration) return 0;

    const [hours, minutes] = duration
        .split(':')
        .map(Number);

    return hours * 60 + minutes;
};

export const formatMinutes = (
    totalMinutes: number
): string => {
    const hours = Math.floor(
        totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(
        2,
        '0'
    )}:${String(minutes).padStart(
        2,
        '0'
    )}`;
};

