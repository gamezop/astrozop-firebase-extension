<!-- 
This file provides your users an overview of your extension. All content is optional, but this is the recommended format. Your users will see the contents of this file when they run the `firebase ext:info` command.

Include any important functional details as well as a brief description for any additional setup required by the user (both pre- and post-installation).

Learn more about writing a PREINSTALL.md file in the docs:
https://firebase.google.com/docs/extensions/publishers/user-documentation#writing-preinstall
-->

# Overview

This Firebase extension integrates with [Astrozop's Notification Content API](https://docs.platform.gamezop.com/publishers/astrozop/astrozop-notifications-content-api) to provide fresh, daily content for user notifications. It's designed for Astrozop publishers to engage users with personalized, relevant content like daily horoscopes, reducing manual effort and boosting retention.

When triggered by an HTTP request or scheduled task, the extension fetches personalized notification content from Astrozop and sends it to relevant Firebase Cloud Messaging (FCM) topics.

## Pre-installation Setup

- Contact <sales@gamezop.com> to obtain your Astrozop token. This token is required during the extension installation process.
- Optionally, select the deployment region (default is us-central1).

## Billing

This extension uses other Firebase or Google Cloud Platform services which may have associated charges:

- Cloud Functions

When you use Firebase Extensions, you're only charged for the underlying resources that you use. A paid-tier billing plan is only required if the extension uses a service that requires a paid-tier plan, for example calling to a Google Cloud Platform API or making outbound network requests to non-Google services. All Firebase services offer a free tier of usage. [Learn more about Firebase billing.](https://firebase.google.com/pricing)

The only charge you will be incurring will be the Firebase resource utilization. There is no cost associated with the usage of Our API.
