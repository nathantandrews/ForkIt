import type { Restaurant } from "../../types/models";

/**
 * Parses a simple time range string like "05:30-22:00"
 * and applies it to all days of the week.
 */
export function parseHoursString(
    hoursStr: string | null
): Restaurant["openHours"] | undefined {
    if (!hoursStr) return undefined;

    const match = hoursStr.trim().match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (!match) return undefined;

    const [, startTime, endTime] = match;

    return [
        {
            days: [0, 1, 2, 3, 4, 5, 6], // all days assumed
            start: startTime,
            end: endTime,
        },
    ];
}
