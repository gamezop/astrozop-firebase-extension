import * as admin from "firebase-admin";
import {AstrozopNotificationService} from "./service";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

/**
 * Sends daily horoscope notifications to all zodiac sign topics
 */
export const sendAstrozopHoroscopeNotifications =
  async (): Promise<string | null> => {
      const service = new AstrozopNotificationService();
      return service.sendDailyNotifications();
  };
