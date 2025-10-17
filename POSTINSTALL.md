# Using the Extension

Once installed, the extension sets up a cron job to trigger a Cloud Function that fetches daily content from Astrozop and distributes it to relevant Firebase Cloud Messaging (FCM) topics. This ensures users receive fresh, engaging notifications without manual content creation.

The extension creates the following 13 FCM topics:

- astrozop-notifications-gemini
- astrozop-notifications-capricorn
- astrozop-notifications-scorpio
- astrozop-notifications-libra
- astrozop-notifications-cancer
- astrozop-notifications-taurus
- astrozop-notifications-leo
- astrozop-notifications-pisces
- astrozop-notifications-aquarius
- astrozop-notifications-virgo
- astrozop-notifications-aries
- astrozop-notifications-generic

Each topic stores notification data in this JSON format:

```json
{
  "cta_text": "READ NOW",
  "cta_url": "https://XXXX.read.astrozop.com/horoscope/aries-daily-horoscope-today",
  "image_url": "https://static.astrozop.com/assets/images/horoscope_notification_image/aries-30114011024c59db8caabe58f3299432.png",
  "text_with_name": "Hey `username`, as a aries, a powerful new path beckons, promising exciting adventures and opportunities you won't want to miss...",
  "text_without_name": "The stars align for a day of purpose and drive, but a spontaneous adventure is on the horizon, changing everything...",
  "title_with_name": "`username`, Your Purpose Unfolds",
  "title_without_name": "Your Purpose Unfolds"
}
```

## Personalization Logic

- **Sun Sign Computation**: If the user's date of birth (DOB) is known, compute the sun sign using this table:

  | Sun Sign | Start Date | End Date |
  | :--- | :--- | :--- |
  | **Aquarius** | **January 20** | **February 18** |
  | **Pisces** | **February 19** | **March 20** |
  | **Aries** | **March 21** | **April 19** |
  | **Taurus** | **April 20** | **May 20** |
  | **Gemini** | **May 21** | **June 20** |
  | **Cancer** | **June 21** | **July 22** |
  | **Leo** | **July 23** | **August 22** |
  | **Virgo** | **August 23** | **September 22** |
  | **Libra** | **September 23** | **October 22** |
  | **Scorpio** | **October 23** | **November 21** |
  | **Sagittarius** | **November 22** | **December 21** |
  | **Capricorn** | **December 22** | **January 19** |

- If DOB is unknown, use the "astrozop-notifications-generic" topic.
- **Name Personalization**: If the user's name is known, replace `username` in `text_with_name` and `title_with_name`. Otherwise, use `text_without_name` and `title_without_name`.

## Personalization Matrix

| Name Available? | DOB Available? | Topic to Use                      | Content Fields to Use                 |
| --------------- | -------------- | --------------------------------- | ------------------------------------- |
| Yes             | Yes            | astrozop-notifications-{sun_sign} | text_with_name, title_with_name       |
| Yes             | No             | astrozop-notifications-generic    | text_with_name, title_with_name       |
| No              | Yes            | astrozop-notifications-{sun_sign} | text_without_name, title_without_name |
| No              | No             | astrozop-notifications-generic    | text_without_name, title_without_name |

<!-- We recommend keeping the following section to explain how to monitor extensions with Firebase -->

## Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
