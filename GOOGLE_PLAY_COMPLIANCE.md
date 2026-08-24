# Google Play compliance checklist

Last reviewed: 2026-08-23

This file records the release tasks that cannot be completed by mobile source
changes alone. Review it for every Google Play submission and whenever an SDK,
permission, API, or data flow changes.

## Required before submission

- Publish a public, non-editable, non-geofenced HTML privacy policy at
  `https://earnwithfreelancing.com/privacy`. The URL currently returns HTTP 404.
- Publish terms at `https://earnwithfreelancing.com/terms`. The URL currently
  returns HTTP 404.
- Publish a public account-deletion page and enter its URL in Play Console. The
  page must explain how users request deletion, which data is deleted, which
  data must be retained, why it is retained, and for how long.
- Connect the in-app account-deletion request to a verified operational process
  that permanently deletes the account and associated data. Deactivation alone
  is not sufficient.
- Complete and keep the Play Console Data safety form consistent with the live
  backend and SDK behavior.
- Complete the Financial features declaration. The app maintains earnings,
  wallet, withdrawal, bank-account, and UPI data, so the declaration must reflect
  the exact business and payment flow.
- Add current privacy-policy, terms, deletion, support, and developer contact
  URLs to the store listing.
- Configure a private upload key through Gradle properties; never ship a release
  signed with the repository's debug key.

## Data safety inventory to verify

The app source handles at least the following data. Confirm collection, sharing,
purpose, optionality, encryption in transit, retention, and deletion with the
production backend owner before answering Play Console.

- Account data: user ID, authentication token, name, mobile number, email, and
  profile details.
- Location: precise and approximate foreground location used when the user asks
  the app to fill an address.
- User content: property/enquiry details, images, documents, leads, and support
  chat messages.
- Financial data: wallet balance, payment history, withdrawal requests, bank
  account details, and UPI details.
- App activity: notification state, lead activity, and account actions returned
  by the backend.
- Device identifiers: Firebase and Expo push-notification tokens.
- Third parties/processors visible in source: the application API, Firebase
  Cloud Messaging, Firebase Realtime Database, Expo notifications, and the
  postal PIN-code service.

## Release configuration

Provide these values in a private user or CI Gradle properties file. Do not
commit their values:

```properties
EARN_MONEY_UPLOAD_STORE_FILE=/absolute/path/to/upload-key.jks
EARN_MONEY_UPLOAD_STORE_PASSWORD=replace-with-secret
EARN_MONEY_UPLOAD_KEY_ALIAS=replace-with-alias
EARN_MONEY_UPLOAD_KEY_PASSWORD=replace-with-secret
```

The project targets API 35. Google Play requires API 36 for new apps and updates
starting August 31, 2026, so the Android toolchain and dependencies must be
upgraded and tested before submissions on or after that date.

## Store-listing review

- Describe earnings, eligibility, lead acceptance, withdrawal minimums, payout
  timing, fees, rejection conditions, and dispute/support routes accurately.
- Do not promise guaranteed income or imply that every submitted lead earns a
  payment.
- Use screenshots and descriptions that match the production app and backend.
- Keep test names, phone numbers, email addresses, property listings, and images
  out of production-visible screens unless clearly labeled as examples.
- Confirm the content rating, target audience, ads declaration, app-access
  instructions, and reviewer credentials in Play Console.
