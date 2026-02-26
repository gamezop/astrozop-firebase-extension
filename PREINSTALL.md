# Overview

This extension sends daily horoscope push notifications to your users using Firebase Cloud Messaging, with content provided by Astrozop.

When your users click on the notifications, they are taken to a web page containing your [Astrozop Unique Link](https://docs.platform.gamezop.com/publishers/astrozop/integrate-unique-link) so that revenue from the ads shown on that page can be attributed to you and shared with you under Gamezop Business' revenue-sharing program.

Please review the requirements and setup steps below before installing.

## Prerequisites

Before installing this extension, make sure that:

- Your Firebase project has **Cloud Messaging** enabled.
- **Cloud Functions** are enabled in your project.
- You have a [**Gamezop Business Property ID** for Astrozop](https://docs.platform.gamezop.com/publishers/get-started/key-terms) and a valid **Bearer Token** for the [Astrozop Notifications Content API](https://docs.platform.gamezop.com/publishers/astrozop/astrozop-notifications-content-api).
- Your app is already configured to receive FCM push notifications.

If you wish to sign up as an Astrozop partner, contact us at <partnerships@gamezop.com>

## Important notes

- This extension supports **one installation per Firebase project**.
- Horoscope personalization is based on **sun sign and local timezone**.
- No user data is stored server-side by this extension.
- You must integrate the Astrozop helper code in your app for notifications to work. Know more about the helper code [here](https://github.com/gamezop/astrozop-firebase-extension-demo-apps).

## What this extension does not do

- It does not calculate horoscopes on-device.
- It does not manage user consent or opt-in flows.
- It does not send notifications unless users are subscribed to the correct FCM topics.

## Billing

To install an extension, your project must be on the [Blaze (pay as you go) plan](https://firebase.google.com/pricing). There is no cost associated with the usage of the Astrozop APIs associated with this extension.

If you are ready and meet the requirements above, you can proceed with the installation.
