import axios, {isAxiosError} from "axios";
import {NotificationContent, AstrozopApiResponse} from "../types";
import {version} from "../../package.json";

/**
 * Client for interacting with the Astrozop API
 */
export class AstrozopApiClient {
    private readonly apiUrl = "https://api.astrozop.com/v2/notification-text";
    private readonly apiTimeout = 60_000; // 60 seconds

    /**
     * Fetches notification content from Astrozop API
     * @param {string} token - The API authentication token
     * @return {Promise<NotificationContent>} The notification content
     */
    async fetchNotificationContent(
        token: string
    ): Promise<NotificationContent> {
        try {
            const response = await axios.get<AstrozopApiResponse>(
                this.apiUrl,
                {
                    headers: {
                        "accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "User-Agent": `astrozop-firebase-extension/${version}`,
                    },
                    timeout: this.apiTimeout,
                }
            );

            if (response.status !== 200) {
                throw new Error(
                    `Astrozop API responded with status ${response.status}`
                );
            }

            const notificationContent = response.data?.data?.notification_text;

            if (!notificationContent || typeof notificationContent !== "object") {
                throw new Error(
                    "Invalid API response structure: " +
                    `${JSON.stringify(response.data)}`
                );
            }

            return notificationContent;
        } catch (err) {
            if (isAxiosError(err)) {
                const status = err.response?.status;
                const message = err.response?.data?.message || err.message;
                throw new Error(
                    `Failed to fetch from Astrozop API (status ${status}): ${message}`
                );
            }
            throw err;
        }
    }
}
