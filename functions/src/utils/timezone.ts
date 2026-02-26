import {TimezoneOffset} from "../types";

/**
 * Gets the configured SCHEDULE_TIME from environment
 * @return {object} hours and minutes
 */
export function getScheduleTime(): { hours: number; minutes: number } {
    const scheduleTime = process.env.SCHEDULE_TIME || "09:00";
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    return {hours, minutes};
}

/**
 * Calculates the timezone offset where local time matches SCHEDULE_TIME
 * based on current UTC time.
 *
 * For example:
 * - Current UTC: 03:30, SCHEDULE_TIME: 09:00
 * - Offset needed: +05:30 (UTC+05:30 has local time 09:00)
 * - Returns: { direction: 'a', offsetHHMM: '0530' }
 *
 * @param {Date} currentUtcTime - Current UTC time
 * @return {TimezoneOffset} The timezone offset to target
 */
export function calculateTargetTimezone(currentUtcTime: Date): TimezoneOffset {
    const {hours: scheduleHours, minutes: scheduleMinutes} =
        getScheduleTime();

    // Get current UTC hours and minutes
    const utcHours = currentUtcTime.getUTCHours();
    const utcMinutes = currentUtcTime.getUTCMinutes();

    // Convert to total minutes for easier calculation
    const scheduleInMinutes = scheduleHours * 60 + scheduleMinutes;
    const utcInMinutes = utcHours * 60 + utcMinutes;

    // Snap down to the 30-minute boundary to handle execution delays
    // e.g., 03:32 → 03:30, 03:44 → 03:30, 03:59 → 03:30
    const roundedUtcMinutes = Math.floor(utcInMinutes / 30) * 30;

    // Calculate offset in minutes
    // offset = scheduleTime - utcTime
    // If schedule is 09:00 and UTC is 03:30, offset = 540 - 210 = 330 (+05:30)
    let offsetMinutes = scheduleInMinutes - roundedUtcMinutes;

    // Normalize to valid timezone range (-12:00 to +14:00)
    const minTimezoneOffset = -12 * 60; // -720 minutes (UTC-12:00)
    const maxTimezoneOffset = 14 * 60; // +840 minutes (UTC+14:00)
    const hoursInDay = 24 * 60; // 1440 minutes

    if (offsetMinutes > maxTimezoneOffset) {
        offsetMinutes -= hoursInDay; // Subtract 24 hours
    } else if (offsetMinutes < minTimezoneOffset) {
        offsetMinutes += hoursInDay; // Add 24 hours
    }

    // Determine direction and absolute offset
    // a = ahead (+), b = behind (-)
    const direction: "a" | "b" = offsetMinutes >= 0 ? "a" : "b";
    const absOffsetMinutes = Math.abs(offsetMinutes);

    // Convert to HHMM format
    const offsetHours = Math.floor(absOffsetMinutes / 60);
    const offsetMins = absOffsetMinutes % 60;
    const offsetHHMM = String(offsetHours).padStart(2, "0") +
        String(offsetMins).padStart(2, "0");

    return {direction, offsetHHMM};
}

/**
 * Formats a TimezoneOffset to a human-readable label
 * @param {TimezoneOffset} timezone - The timezone to format
 * @return {string} Formatted label (e.g., "UTC+05:30")
 */
export function formatTimezoneLabel(timezone: TimezoneOffset): string {
    return `UTC${timezone.direction === "a" ? "+" : "-"}` +
        `${timezone.offsetHHMM.slice(0, 2)}:${timezone.offsetHHMM.slice(2)}`;
}
