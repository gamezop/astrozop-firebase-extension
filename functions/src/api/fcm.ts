import {getMessaging, MessagingClientErrorCode} from "firebase-admin/messaging";
import {
    ZODIAC_SIGNS,
    ZodiacSign,
    SignData,
    NotificationContent,
    TimezoneOffset,
    SendResult,
} from "../types";
import {formatTimezoneLabel} from "../utils/timezone";

/**
 * FCM error codes that should NOT be retried (permanent failures)
 * Based on: https://firebase.google.com/docs/cloud-messaging/scale-fcm
 */
const NON_RETRYABLE_ERROR_CODES: MessagingClientErrorCode[] = [
    "messaging/invalid-argument", // 400
    "messaging/authentication-error", // 401
    "messaging/registration-token-not-registered", // 404
    "messaging/invalid-recipient", // 400
    "messaging/invalid-payload", // 400
];

/**
 * Configuration for FCM retry behavior
 */
interface FcmRetryConfig {
    maxRetries: number;
    minRetryDelayMs: number;
    maxRetryDelayMs: number;
    defaultRetryAfterMs: number;
}

/**
 * Default FCM retry configuration based on best practices
 */
const DEFAULT_FCM_CONFIG: FcmRetryConfig = {
    maxRetries: 5,
    minRetryDelayMs: 10_000, // 10 seconds minimum
    maxRetryDelayMs: 5 * 60_000, // 5 minutes max
    defaultRetryAfterMs: 60_000, // 60 seconds for 429
};

/**
 * Service for sending FCM notifications with retry logic and error handling
 * Implements FCM best practices for scaling and reliability
 */
export class FcmNotificationSender {
/**
 * Creates an instance of the FCM class with the specified retry configuration.
 * @param {FcmRetryConfig} config - The configuration for FCM retry behavior.
 */
    constructor(private readonly config: FcmRetryConfig = DEFAULT_FCM_CONFIG) { }

    /**
     * Builds the FCM topic name for a zodiac sign and timezone
     * Format: {sign}-utc-{a|b}-{HHMM}
     * @param {ZodiacSign} sign - The zodiac sign
     * @param {TimezoneOffset} timezone - The timezone offset
     * @return {string} The topic name
     */
    private buildTopicName(
        sign: ZodiacSign,
        timezone: TimezoneOffset
    ): string {
        return `${sign}-utc-${timezone.direction}-${timezone.offsetHHMM}`;
    }

    /**
     * Sends a notification to a specific zodiac sign topic for a timezone
     * @param {ZodiacSign} sign - The zodiac sign to send to
     * @param {SignData} signData - The notification data for the sign
     * @param {TimezoneOffset} timezone - The target timezone
     * @return {Promise<void>} Resolves on success, throws on failure
     */
    private async sendNotificationToTopic(
        sign: ZodiacSign,
        signData: SignData,
        timezone: TimezoneOffset
    ): Promise<void> {
        const topic = this.buildTopicName(sign, timezone);

        // Build FCM data payload
        const data: Record<string, string> = {
            sun_sign: sign,
        };

        for (const [key, value] of Object.entries(signData)) {
            if (value === null || value === undefined) {
                throw new Error(
                    `Invalid null/undefined value for key "${key}" ` +
                    `in sign "${sign}"`
                );
            }
            data[key] = String(value);
        }

        const message = {
            topic,
            data,
        };

        await getMessaging().send(message);
    }

    /**
     * Checks if an FCM error is retryable based on error code
     * @param {unknown} err - The error to check
     * @return {object} Object with isRetryable flag and optional retryAfterMs
     */
    private analyzeError(err: unknown): {
        isRetryable: boolean;
        retryAfterMs?: number;
        errorMessage: string;
    } {
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Check if it's a Firebase MessagingError with a code
        if (
            err &&
            typeof err === "object" &&
            "code" in err &&
            typeof (err as { code: unknown }).code === "string"
        ) {
            const code = (err as { code: string }).code as MessagingClientErrorCode;

            // Non-retryable errors (400, 401, 403, 404 equivalent)
            if (NON_RETRYABLE_ERROR_CODES.includes(code)) {
                return {isRetryable: false, errorMessage};
            }

            // 429 - quota exceeded, check for retry-after
            if (code === "messaging/quota-exceeded") {
                return {
                    isRetryable: true,
                    retryAfterMs: this.config.defaultRetryAfterMs,
                    errorMessage,
                };
            }

            // 500-level errors are retryable
            if (
                code === "messaging/server-unavailable" ||
                code === "messaging/internal-error"
            ) {
                return {isRetryable: true, errorMessage};
            }
        }

        // Default: assume retryable for unknown errors
        return {isRetryable: true, errorMessage};
    }

    /**
     * Calculates delay with exponential backoff and jitter
     * Based on FCM best practices:
     * - Minimum 10 second delay
     * - Exponential increase: 10s, 20s, 40s, 80s, 160s
     * - Jitter: ±20% random variation
     *
     * @param {number} attempt - The attempt number (0-indexed)
     * @return {number} Delay in milliseconds
     */
    private calculateBackoffWithJitter(attempt: number): number {
    // Exponential: 10s * 2^attempt
        const baseDelay = this.config.minRetryDelayMs * Math.pow(2, attempt);

        // Cap at max delay
        const cappedDelay = Math.min(baseDelay, this.config.maxRetryDelayMs);

        // Add jitter: ±20% random variation
        const jitterFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const delayWithJitter = Math.floor(cappedDelay * jitterFactor);

        return delayWithJitter;
    }

    /**
     * Delays execution for the specified duration
     * @param {number} ms - Delay in milliseconds
     */
    private async delay(ms: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Sends a notification to a single topic with retry logic
     * Implements FCM best practices:
     * - Up to 5 retries
     * - Exponential backoff with jitter (min 10s)
     * - Proper error code handling
     *
     * @param {ZodiacSign} sign - The zodiac sign
     * @param {SignData} signData - The notification data
     * @param {TimezoneOffset} timezone - The target timezone
     * @return {Promise<SendResult>} Result of the send attempt
     */
    private async sendWithRetry(
        sign: ZodiacSign,
        signData: SignData,
        timezone: TimezoneOffset
    ): Promise<SendResult> {
        const topic = this.buildTopicName(sign, timezone);

        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                await this.sendNotificationToTopic(sign, signData, timezone);
                console.log(`✓ Sent notification to topic "${topic}"`);
                return {sign, topic, success: true};
            } catch (err) {
                const {isRetryable, retryAfterMs, errorMessage} =
                    this.analyzeError(err);

                // If not retryable, fail immediately
                if (!isRetryable) {
                    console.error(
                        `✗ Permanent failure for topic "${topic}": ${errorMessage}`
                    );
                    return {
                        sign,
                        topic,
                        success: false,
                        error: errorMessage,
                        permanent: true,
                    };
                }

                // If this was the last attempt, fail
                if (attempt === this.config.maxRetries) {
                    console.error(
                        `✗ Failed to send to topic "${topic}" after ` +
                        `${this.config.maxRetries + 1} attempts: ${errorMessage}`
                    );
                    return {sign, topic, success: false, error: errorMessage};
                }

                // Calculate delay (use retry-after if provided, otherwise backoff)
                const delayMs = retryAfterMs ||
                    this.calculateBackoffWithJitter(attempt);

                console.log(
                    `⚠ Attempt ${attempt + 1}/${this.config.maxRetries + 1} failed for ` +
                    `topic "${topic}": ${errorMessage}. ` +
                    `Retrying in ${Math.round(delayMs / 1000)}s...`
                );

                await this.delay(delayMs);
            }
        }

        // Should not reach here, but TypeScript needs a return
        return {sign, topic, success: false, error: "Max retries exceeded"};
    }

    /**
     * Sends notifications to all zodiac sign topics for a specific timezone
     * Sends sequentially (not in parallel) to avoid FCM rate limiting spikes
     *
     * @param {NotificationContent} content - The notification content
     * @param {TimezoneOffset} timezone - The target timezone
     * @return {Promise<void>} Resolves on success, throws if any send fails
     */
    async sendAll(
        content: NotificationContent,
        timezone: TimezoneOffset
    ): Promise<void> {
        const tzLabel = formatTimezoneLabel(timezone);

        console.log(`Sending notifications to timezone: ${tzLabel}`);
        console.log(
            `Processing ${ZODIAC_SIGNS.length} signs sequentially ` +
            `with up to ${this.config.maxRetries + 1} attempts each...`
        );

        const results: SendResult[] = [];

        // Send sequentially to avoid spikes (FCM best practice)
        for (const sign of ZODIAC_SIGNS) {
            const result = await this.sendWithRetry(
                sign,
                content[sign],
                timezone
            );
            results.push(result);

            // Small delay between successful sends to smooth traffic
            // (only if successful, failures already have backoff)
            if (result.success) {
                // Add small jittered delay (100-500ms) between sends
                await this.delay(100 + Math.random() * 400);
            }
        }

        // Summarize results
        const successful = results.filter((r) => r.success);
        const failed = results.filter((r) => !r.success);

        console.log(
            `Completed: ${successful.length}/${ZODIAC_SIGNS.length} ` +
            `notifications sent successfully for ${tzLabel}`
        );

        // If any notifications failed, throw an error with details
        if (failed.length > 0) {
            const failedDetails = failed
                .map((r) => `${r.sign}: ${r.error}${r.permanent ? " (permanent)" : ""}`)
                .join("\n");

            throw new Error(
                `Failed to send ${failed.length} notification(s):\n${failedDetails}`
            );
        }
    }
}
