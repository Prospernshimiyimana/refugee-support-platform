# Firebase Authentication Setup

This document explains how to set up and use Firebase Authentication in the Refugee Support Platform.

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Authentication in your project

### 2. Configure Authentication

1. In Firebase Console, go to Authentication → Sign-in method
2. Enable "Email/Password" authentication
3. Save your settings

### 3. Get Configuration Values

From your Firebase project settings, copy these values:
- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

### 4. Update Environment Variables

Update the `.env.local` file with your actual Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

## Usage Examples

### Import Authentication Functions

```typescript
import { signUp, login, logout, getCurrentUser } from '@/app/lib/auth';
```

### Sign Up New User

```typescript
const result = await signUp('user@example.com', 'password123');

if (result.success) {
  console.log('User signed up:', result.user);
} else {
  console.error('Sign up failed:', result.error);
}
```

### Login Existing User

```typescript
const result = await login('user@example.com', 'password123');

if (result.success) {
  console.log('User logged in:', result.user);
} else {
  console.error('Login failed:', result.error);
}
```

### Logout User

```typescript
const result = await logout();

if (result.success) {
  console.log('User logged out successfully');
} else {
  console.error('Logout failed:', result.error);
}
```

### Get Current User

```typescript
const currentUser = getCurrentUser();
if (currentUser) {
  console.log('Current user:', currentUser.email);
}
```

### Listen to Auth State Changes

```typescript
import { onAuthStateChanged } from '@/app/lib/auth';

const unsubscribe = onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', user.email);
  } else {
    console.log('User is signed out');
  }
});

// Don't forget to unsubscribe when component unmounts
// unsubscribe();
```

## File Structure

```
src/app/
├── lib/
│   ├── firebase.ts     # Firebase configuration and initialization
│   └── auth.ts         # Authentication helper functions
└── components/         # Your React components
```

## Error Handling

All authentication functions return a standardized `AuthResult` object:

```typescript
interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}
```

Common error messages include:
- "Email and password are required"
- "Password must be at least 6 characters long"
- "This email is already registered"
- "No account found with this email"
- "Incorrect password"
- "Network error. Please check your connection"

## Security Notes

- Never expose Firebase Admin SDK credentials in client-side code
- Always validate inputs before sending to Firebase
- Use HTTPS in production
- Consider implementing additional security measures like rate limiting
- Store sensitive data securely in Firestore or your backend
