// lib/time.ts

export function durationToMinutes(duration: string): number {
    const normalized = duration.trim();

    const match = /^(\d+):([0-5]\d)$/.exec(normalized);

    if (!match) {
        return 0;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    return hours * 60 + minutes;
}

export function minutesToDuration(totalMinutes: number): string {
    if (!Number.isSafeInteger(totalMinutes) || totalMinutes < 0) {
        return '00:00';
    }

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function decimalHoursFromMinutes(totalMinutes: number): number {
    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
        return 0;
    }

    return totalMinutes / 60;
}
