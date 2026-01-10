# Admin Chat Guide

## How Admins Can Reply to User Messages

### Authorized Admin Phone Numbers (Managed in Database)

Admin phone numbers are now stored in Firebase Realtime Database at: `config/adminPhones`

**Current Admins:**

- +91 93897 35755
- +91 89296 07491

**To Add/Remove Admin Numbers:**

1. Go to Firebase Console → Realtime Database
2. Navigate to `config/adminPhones`
3. Edit the array to add or remove phone numbers
4. Changes take effect immediately for all users

### Admin Status Management

Admins can set their status to show users their availability:

**Status Options:**

- `online` - Shows green dot with "Online"
- `offline` - Shows gray dot with "Offline"
- `typing` - Shows "typing..." in primary color

**To Set Admin Status:**

```javascript
// In Firebase Console or Admin SDK
database.ref('adminStatus/status').set('online'); // or 'offline' or 'typing'
```

### Method 1: Using Firebase Console (Web)

1. **Access Firebase Console**

   - Go to: https://console.firebase.google.com/
   - Select project: `onlinecall-c4e67`
   - Navigate to: Realtime Database

2. **Find User Chats**

   - Database path: `chats/{userid}/messages`
   - Each user has their own chat room identified by their `userid`

3. **Reply to a User**
   - Click on the user's chat: `chats/{userid}/messages`
   - Click the "+" button to add a new message
   - Add the following fields:
     ```
     text: "Your reply message here"
     sender: "admin"
     timestamp: (current timestamp in milliseconds)
     userId: "admin"
     ```

### Method 2: Using Firebase Admin SDK (Recommended for bulk replies)

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    'https://onlinecall-c4e67-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const db = admin.database();

// Reply to a specific user
async function replyToUser(userId, messageText) {
  const chatRef = db.ref(`chats/${userId}/messages`);
  await chatRef.push({
    text: messageText,
    sender: 'admin',
    timestamp: Date.now(),
    userId: 'admin',
  });
  console.log(`Reply sent to user ${userId}`);
}

// Example usage
replyToUser('2', 'Hello! Thank you for reaching out. How can I help you?');
```

### Method 3: Build a Simple Admin Web App

Create a simple web interface where admins can:

- See all active chats
- View message history
- Reply to users in real-time

### Database Structure

```
chats/
  └── {userid}/          // User's unique ID
      └── messages/
          ├── {messageId1}/
          │   ├── text: "User message"
          │   ├── sender: "user"
          │   ├── timestamp: 1704356400000
          │   └── userId: "2"
          └── {messageId2}/
              ├── text: "Admin reply"
              ├── sender: "admin"
              ├── timestamp: 1704356460000
              └── userId: "admin"
```

### Initial Greeting Message

When a user opens the chat for the first time, they automatically receive:

> "Hello! Welcome to Earn Money Support. How can we assist you today? Our support team will respond to your queries shortly."

### Security Rules (Recommended)

Add these rules to Firebase Realtime Database to ensure only authorized users can access their chats:

```json
{
  "rules": {
    "chats": {
      "$userId": {
        ".read": "$userId === auth.uid || auth.token.phone_number === '+919389735755' || auth.token.phone_number === '+918929607491'",
        ".write": "$userId === auth.uid || auth.token.phone_number === '+919389735755' || auth.token.phone_number === '+918929607491'"
      }
    }
  }
}
```

### Tips for Admins

1. **Response Time**: Try to respond within a few hours for better user experience
2. **Professional Tone**: Keep responses helpful and professional
3. **Common Queries**: Create templates for frequently asked questions
4. **Escalation**: For complex issues, collect user details and follow up via phone
