# Astrozop: Daily Horoscope Notifications

Send daily horoscope push notifications to your users based on their sun sign and local timezone, powered by Astrozop.

This Firebase Extension allows app developers to easily increase engagement and monetize traffic by delivering daily astrology content via Firebase Cloud Messaging.

## Table Of Contents

- [What this extension does](#what-this-extension-does)
- [How it works](#how-it-works)
- [Requirements](#requirements)
- [Configuration options](#configuration-options)
- [Supported platforms](#supported-platforms)
- [Privacy and data handling](#privacy-and-data-handling)
- [Uninstall behavior](#uninstall-behavior)
- [Support](#support)

## What this extension does

1. Sends one daily push notification per user.
2. Content is personalized by sun sign.
3. Delivery happens at a partner-configured local time, adjusted per user timezone.
4. Notifications include:
    1. Title
    2. Message body
    3. Image (optional)
    4. Click-through web URL containing correct Property ID
5. Clicking the notification opens Astrozop, with automatic revenue attribution

## How it works

1. Install the extension in your Firebase project.
2. Configure a daily send time and provide your Astrozop Notifications Content API Token
3. Integrate the Astrozop helper code in your app.
4. The helper code:
    1. Determines the user's sun sign from birthdate
    2. Determines the user's UTC offset
    3. Subscribes the user to the correct FCM topic
5. The extension:
    1. Fetches daily horoscope content from Astrozop's systems
    2. Sends topic-based notifications at the correct local time for
        each user

**No user data is stored server-side.**

## Requirements

1. Firebase project with Cloud Messaging enabled
2. Cloud Functions and Cloud Scheduler enabled
3. Gamezop Business account and Astrozop Notifications Content API Token

## Configuration options

During installation, you will be asked to provide:

1. **Astrozop Notifications Content API Token**:\
    Used to authenticate and identify your Property ID.

2. **Daily Send Time**:\
    Time of day when users receive their horoscope, interpreted in each
    user's local timezone.

## Supported platforms

- **Android**
- **iOS**
- **Web**

All platforms use Firebase Cloud Messaging topic subscriptions.

## Privacy and data handling

1. **Birthdates** and **timezone** are handled on the client only
2. No personally identifiable user data is stored by the extension
3. Topic-based messaging is used for scale and privacy

## Uninstall behavior

Uninstalling the extension automatically stops all scheduled notifications. No additional cleanup is required.

## Support

helpdesk [at] gamezop.com
