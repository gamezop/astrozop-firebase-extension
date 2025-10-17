import {AstrozopApiClient} from "./api/astrozop";
import {FcmNotificationSender} from "./api/fcm";
import {calculateTargetTimezone, formatTimezoneLabel} from "./utils/timezone";
import {validateNotificationContent} from "./types";

/**
 * Service class for sending daily zodiac notifications via FCM
 * Orchestrates the workflow: fetch content, validate, calculate timezone, send
 */
export class AstrozopNotificationService {
    private readonly apiClient: AstrozopApiClient;
    private readonly fcmSender: FcmNotificationSender;

    /**
   * Initializes the service  Astrozop API client and FCM notification sender.
   */
    constructor() {
        this.apiClient = new AstrozopApiClient();
        this.fcmSender = new FcmNotificationSender();
    }

    /**
   * Validates that the API token is properly configured
   * @return {string} API authentication token
   */
    private validateEnvironment(): string {
        const astrozopToken = process.env.ASTROZOP_API_TOKEN;
        if (!astrozopToken || astrozopToken.trim() === "") {
            throw new Error("ASTROZOP_API_TOKEN is not set or is empty");
        }
        return astrozopToken;
    }

    /**
   * Main method to send daily zodiac notifications
   * Calculates the target timezone based on current UTC time and SCHEDULE_TIME,
   * then sends notifications only to that timezone's topics.
   *
   * @return {Promise<string | null>} Null on success, error message on failure
   */
    async sendDailyNotifications(): Promise<string | null> {
        try {
            const now = new Date();
            console.log("Starting daily zodiac notifications process...");
            console.log(`Current UTC time: ${now.toISOString()}`);

            // Step 1: Calculate target timezone
            const targetTimezone = calculateTargetTimezone(now);
            const tzLabel = formatTimezoneLabel(targetTimezone);
            console.log(`Target timezone: ${tzLabel}`);

            // Step 2: Validate environment
            const astrozopToken = this.validateEnvironment();
            console.log("Environment validated");

            // Step 3: Fetch notification content from API
            const notificationContent =
        await this.apiClient.fetchNotificationContent(astrozopToken);
            console.log("Fetched notification content from Astrozop API");

            // Step 4: Validate that all zodiac signs have data
            validateNotificationContent(notificationContent);
            console.log("Validated notification content for all zodiac signs");

            // Step 5: Send notifications to the target timezone
            await this.fcmSender.sendAll(notificationContent, targetTimezone);
            console.log(
                `Completed sending notifications to ${tzLabel} timezone topics`
            );

            return null; // Success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error("Error in sendDailyNotifications:", errorMessage);
            return errorMessage;
        }
    }
}
