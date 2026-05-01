# Protected Routes System

This document explains how to use the protected route system to restrict access to certain pages based on authentication status.

## Overview

The protected route system ensures that only authenticated users can access specific pages in the Refugee Support Platform. Unauthenticated users are automatically redirected to the login page.

## Components

### 1. ProtectedRoute Component

A wrapper component that protects its children from unauthenticated access.

```typescript
import ProtectedRoute from '@/app/components/ProtectedRoute';

function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

**Props:**
- `children` (required): The content to protect
- `redirectTo` (optional): Custom redirect URL (defaults to '/login')

### 2. withAuth Higher-Order Component

A HOC that wraps entire page components with protection.

```typescript
import { withAuth } from '@/app/hocs/withAuth';

function MyPage() {
  return <div>Protected content</div>;
}

export default withAuth(MyPage);
```

**Options:**
- `redirectTo`: Custom redirect URL (defaults to '/login')

### 3. Authentication Hooks

Utility hooks for checking authentication status.

```typescript
import { useIsAuthenticated, useCurrentUser } from '@/app/utils/auth';

function MyComponent() {
  const { isAuthenticated, loading } = useIsAuthenticated();
  const { user, loading } = useCurrentUser();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome, {user?.email}!</div>;
}
```

## Usage Examples

### Protecting a Page

```typescript
// app/cases/page.tsx
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function CasesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Your protected page content */}
      </div>
    </ProtectedRoute>
  );
}
```

### Protecting Dynamic Routes

```typescript
// app/cases/[id]/page.tsx
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function CaseDetailPage({ params }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Your protected case details */}
      </div>
    </ProtectedRoute>
  );
}
```

### Using withAuth HOC

```typescript
// app/admin/page.tsx
import { withAuth } from '@/app/hocs/withAuth';

function AdminPage() {
  return <div>Admin dashboard</div>;
}

export default withAuth(AdminPage);
```

### Custom Redirect URL

```typescript
<ProtectedRoute redirectTo="/custom-login">
  <div>Protected content</div>
</ProtectedRoute>

// or with HOC
export default withAuth(MyPage, { redirectTo: '/custom-login' });
```

## Current Protected Routes

The following routes are currently protected:

1. **/cases** - Legal case tracker dashboard
2. **/cases/[id]** - Individual case detail pages

## How It Works

1. **Authentication Check**: The system checks if a user is authenticated using Firebase Auth
2. **Loading State**: Shows a loading spinner while checking authentication
3. **Redirect**: If not authenticated, redirects to the login page
4. **Access Granted**: If authenticated, renders the protected content

## Loading States

Protected routes show a loading spinner while checking authentication status:

```typescript
// Automatic loading state
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
  <div className="flex flex-col items-center space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="text-gray-600 text-sm">Checking authentication...</p>
  </div>
</div>
```

## Adding New Protected Routes

To protect a new route:

1. **Option 1: Using ProtectedRoute Component**
   ```typescript
   import ProtectedRoute from '@/app/components/ProtectedRoute';
   
   export default function NewProtectedPage() {
     return (
       <ProtectedRoute>
         {/* Your page content */}
       </ProtectedRoute>
     );
   }
   ```

2. **Option 2: Using withAuth HOC**
   ```typescript
   import { withAuth } from '@/app/hocs/withAuth';
   
   function NewProtectedPage() {
     return <div>Your page content</div>;
   }
   
   export default withAuth(NewProtectedPage);
   ```

## Future Enhancements

Potential improvements to the protected route system:

1. **Role-based Access Control**: Protect routes based on user roles
2. **Route-specific Loading States**: Custom loading components per route
3. **Redirect with Return URL**: Redirect back to original page after login
4. **Public Route Options**: Allow certain routes to be accessible but with enhanced features for authenticated users

## Security Considerations

- Always verify authentication on both client and server sides
- Use HTTPS in production to protect authentication tokens
- Implement proper session management
- Consider adding rate limiting for login attempts
