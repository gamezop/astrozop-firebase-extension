export const ZODIAC_SIGNS = [
    "aquarius",
    "aries",
    "cancer",
    "capricorn",
    "gemini",
    "leo",
    "libra",
    "pisces",
    "sagittarius",
    "scorpio",
    "taurus",
    "virgo",
    "generic", // Special sign for generic notifications.
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

/**
 * Represents a timezone offset with direction and offset value
 */
export interface TimezoneOffset {
    direction: "a" | "b"; // 'a' = ahead (+), 'b' = behind (-)
    offsetHHMM: string; // e.g., "0530", "0000"
}

/**
 * Notification data for a specific zodiac sign
 */
export interface SignData {
    cta_text: string;
    cta_url: string;
    image_url: string;
    text_with_name: string;
    text_without_name: string;
    title_with_name: string;
    title_without_name: string;
}

export const requiredFields: (keyof SignData)[] = [
    "cta_text",
    "cta_url",
    "image_url",
    "text_with_name",
    "text_without_name",
    "title_with_name",
    "title_without_name",
];

/**
 * Collection of notification content for all zodiac signs
 */
export interface NotificationContent {
    [key: string]: SignData;
}

/**
 * Response structure from Astrozop API
 */
export interface AstrozopApiResponse {
    success?: boolean;
    data?: {
        notification_text?: NotificationContent;
    };
}

/**
 * Result of sending a notification to a single topic
 */
export interface SendResult {
    sign: ZodiacSign;
    topic: string;
    success: boolean;
    error?: string;
    permanent?: boolean; // If true, should not retry
}

/**
 * Validates that notification content has data for all zodiac signs
 * @param {NotificationContent} content - The notification content to validate
 * @throws {Error} If validation fails
 */
export function validateNotificationContent(
    content: NotificationContent
): void {
    const missingSigns: string[] = [];

    for (const sign of ZODIAC_SIGNS) {
        const signData = content[sign];

        if (!signData || typeof signData !== "object") {
            missingSigns.push(sign);
            continue;
        }

        if (Object.keys(signData).length === 0) {
            missingSigns.push(sign);
            continue;
        }

        const missingFields = requiredFields.filter(
            (field) =>
                signData[field] === undefined ||
                signData[field] === null ||
                signData[field] === ""

        );

        if (missingFields.length > 0) {
            throw new Error(
                `Sign "${sign}" is missing required fields: ` +
                `${missingFields.join(", ")}`
            );
        }
    }

    if (missingSigns.length > 0) {
        throw new Error(
            "Missing or invalid data for zodiac signs: " +
            `${missingSigns.join(", ")}`
        );
    }
}
