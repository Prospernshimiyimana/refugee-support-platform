# Firestore Deployment Instructions

## Deploy Firestore Rules

To deploy the Firestore security rules, follow these steps:

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project (if not already done)
```bash
firebase init firestore
```

### 4. Deploy the rules
```bash
firebase deploy --only firestore:rules
```

## Alternative: Manual Setup in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "refugee-support-platform"
3. Navigate to Firestore Database → Rules
4. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all collections for now
    // TODO: Implement proper security rules in production
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click "Publish"

## Verify Firestore is Enabled

1. In Firebase Console, go to Firestore Database
2. If not enabled, click "Create database"
3. Choose "Start in test mode" for now
4. Select a location (choose closest to your users)

## Test the Application

After deploying the rules, test creating cases and news articles:

1. Login as admin (admin@gmail.com / admin123)
2. Go to /dashboard
3. Try creating a new case
4. Try creating a new news article
5. Check the browser console for success messages with document IDs

## Troubleshooting

### Permission Denied Errors
- Ensure Firestore rules are deployed correctly
- Check that the rules allow read/write: if true;

### Network Errors
- Verify Firebase project configuration is correct
- Check that Firestore is enabled in your project
- Ensure you're using the correct project ID

### Missing Fields Error
- The validation now checks for required fields
- All fields (title, status, description) must be filled
- Date is required for news articles

### Timestamp Issues
- Timestamp.fromDate() is used for proper Firestore timestamps
- Both createdAt and updatedAt fields are automatically added
