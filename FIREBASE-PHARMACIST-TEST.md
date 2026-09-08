# Kalidad Pharmacy — Firebase pharmacist chat test setup

The `ai-chatbot-test` branch now uses Firebase Authentication + Cloud Firestore for the live pharmacist handoff. The OpenAI assistant remains behind `/api/ai-chat`.

## 1. Firebase web configuration

Open `firebase-chat-config.js` and replace only:

`PASTE_YOUR_FIREBASE_WEB_API_KEY_HERE`

with the Web API key from Firebase Console → Project settings → Your apps → Web app.

The test project is already set to project `pharmacy-8c04b`.

## 2. Enable Authentication

In Firebase Console → Authentication → Sign-in method, enable:

- Anonymous
- Email/Password

Anonymous Auth is used for website visitors so a visitor can have a secure Firebase UID without creating an account. Pharmacists use Email/Password.

## 3. Create Firestore

Create a Cloud Firestore database in the existing Firebase project. Use production/locked rules rather than open development rules.

Then publish the repository's `firestore.rules` file in Firebase Console → Firestore Database → Rules.

The rules deliberately prevent anonymous visitors from reading other customers' conversations and prevent customers from creating pharmacist/staff messages.

## 4. Create the pharmacist account

In Firebase Console → Authentication → Users, create the pharmacist's Email/Password account.

Copy that user's UID.

In Firestore create:

`staff/{UID}`

with fields:

- `role`: `pharmacist`
- `displayName`: pharmacist's name
- `active`: `true`

For an administrator, use `role: admin`.

The staff document must be created in the Firebase Console or another trusted admin environment because the public client is not allowed to create staff records.

## 5. Test URL

Use the Vercel Preview deployment for the `ai-chatbot-test` branch. Do not merge this branch into `main` yet.

Test the customer side first, then open:

`/pharmacist.html`

in a separate browser/incognito window and sign in as the pharmacist.

## 6. Test flow

1. Open the preview site as a customer.
2. Open the Kalidad chat.
3. Ask a general question such as: `What services do you offer?`
4. Confirm the AI answers.
5. Ask a personal health question such as: `I have a headache, what medicine should I take?`
6. Confirm the AI offers pharmacist handoff rather than diagnosing/prescribing.
7. Accept the consent prompt.
8. Confirm a conversation appears in the pharmacist portal.
9. Reply from the pharmacist portal.
10. Confirm the customer receives the pharmacist reply in the same chat.
11. Send another customer message and confirm it reaches the pharmacist.
12. Refresh both windows and confirm the conversation remains available.

## 7. Security test

Verify that:

- A customer cannot open another customer's conversation by changing an ID.
- A customer cannot write a `staff` message.
- A customer cannot create a fake pharmacist/staff account.
- A non-staff Firebase account cannot enter the pharmacist portal.
- Passwords, PINs and payment/card credentials are not requested in the chat.

## 8. App Check

After the basic flow works, register the website with Firebase App Check and monitor its metrics before enforcing it. Firebase recommends monitoring before enforcement so legitimate traffic is not accidentally blocked.
