# Authentication Rules, and Dependency Enforcement

# Route Configuration, Authentication Rules, and Dependency Enforcement
## Overview
This section explains how routeConfig.json, authentication state (isLoggedIn), role requirements, and onboarding/KYC dependencies work together to control access to routes. It also documents how Cognito attributes such as custom:kyc and custom:lastlogin are created and used. Clear flows are provided for Login, Sign Up, Onboarding steps, KYC onboarding, Password Reset, and Dashboard dependency enforcement. A final section explains how to shim roles in the development authentication system.
# Route Configuration
## Purpose of routeConfig.json
routeConfig.json defines:
*   Path routing (slug)
*   Which bundle (section) to load
*   Whether a route requires the user to be authenticated
*   Where to redirect if the user is not authenticated
*   Where to redirect if the user is already authenticated
*   Which roles are allowed on a route
*   Per-role dependencies (onboardingPassed, kycPassed, etc.)
## Key Fields
### slug
The route path (`/log-in`, `/dashboard`, etc).
### section
Determines which code bundle to load (auth, dashboard-global, etc).
### requiresAuth
Boolean indicating the route participates in auth logic.
The _actual enforcement_ is handled via redirectIfNotAuth + guards.
### redirectIfNotAuth
If the user is not logged in, guards redirect to this path.
### redirectIfLoggedIn
If the user is logged in and visits an auth-only page (log-in, sign-up), guards redirect here.
### supportedRoles
An array controlling which roles can access the route (`["creator"]`, `["all"]`).
### dependencies
Role-based rules that specify required onboarding and KYC steps before a route can be accessed.
# Authentication State
## isLoggedIn
A helper from authUtilities.js.
*   Dynamically imports useAuthStore.
*   Returns true if the store has both:
    *   currentUser object
    *   idToken
This is the actual source of truth for “is the user authenticated”.
## isAuthenticated in useAuthStore
The computed getter used internally.
Used by guards and routeConfig enforcement.
# Dependency Rules (Onboarding & KYC)
## onboardingPassed
Indicates whether the user completed Onboarding Step 1 (role + username).
## kycPassed
Indicates whether the user completed Onboarding Step 2 (creator KYC).
## How Dependencies Are Enforced
1. Read currentUser.role from the store.
2. Read dependencies for that role from routeConfig.
3. For each required dependency:
    *   If false, redirect to fallbackSlug (e.g., `/sign-up/onboarding`, `/sign-up/onboarding/kyc`).
This ensures creators cannot enter `/dashboard` until both onboarding and KYC steps are complete.
# Cognito Attributes for KYC, Role, and Last Login
## Required Custom Attributes
Create these in the Cognito User Pool → Attributes → Custom Attributes:
*   custom:role
*   custom:kyc
*   custom:lastlogin
All must be configured to appear in the **ID token**.
## Adding Attributes to Cognito
### custom:role
Stores the user role (“creator”, “fan”, “agent”, etc).
### custom:kyc
Stores KYC completion.
Value must be `"true"` or `"false"`.
### custom:lastlogin
Stores Unix timestamp (seconds) of last successful login.
## How the Application Sets These Attributes
### Setting Last Login
Inside awsCognitoHandler.js:
*   After successful login:
    *   Compute timestamp with `Math.floor(`[`Date.now`](http://Date.now)`() / 1000).toString()`.
    *   Call updateCognitoUserAttributes with `{ "custom:lastlogin": formattedDate }`.
### Setting KYC Passed
During KYC onboarding:
*   Call updateProfileAttributes with `{ "custom:kyc": "true" }`.
### Ensuring Attributes Are Returned in the ID Token
Check App Client → Token Configuration:
*   Enable custom role, custom KYC, and custom lastlogin attributes for inclusion in the ID token.
*   If not present, add them via Pre Token Generation Lambda trigger.
# Flow Definitions
## Login Flow
1. User navigates to `/log-in`.
2. If already logged in → redirect to `/dashboard`.
3. User submits credentials.
4. authHandler.login authenticates via:
    *   Dev shim (authHandlerDev) OR
    *   Cognito (awsCognitoHandler)
5. Tokens saved in useAuthStore.
6. ID token decoded → sets currentUser, role, onboardingPassed, kycPassed.
7. Cognito updates custom:lastlogin.
8. User redirected to `/dashboard` or onboarding if dependencies not met.
## Sign Up Flow
1. User visits `/sign-up`.
2. Submits email + password.
3. authHandler.signup creates user:
    *   Dev shim OR Cognito signUp
4. User proceeds to:
    *   Onboarding Step 1 (Choose role/username)
## Onboarding Step 1 – Choose Role and Username
1. Triggered when onboardingPassed = false.
2. User selects:
    *   Role
    *   Username
3. In Cognito:
    *   updateProfileAttributes({ "custom:role": "creator" })
4. In store:
    *   onboardingStep1Passed = true
5. If creator:
    *   Redirect to `/sign-up/onboarding/kyc`
6. Otherwise:
    *   Redirect to `/dashboard`
## Onboarding Step 2 – Creator KYC
1. Only required for creator role.
2. User completes KYC.
3. Save attribute:
    *   updateProfileAttributes({ "custom:kyc": "true" })
4. In store:
    *   onboardingCompleted = true
5. Redirect to `/dashboard`.
## Lost Password Flow
1. User visits `/lost-password`.
2. Enters email.
3. authHandler.forgotPassword triggers:
    *   Cognito forgotPassword
4. User receives continues to reset password.
## Reset Password Flow
1. User enters:
    *   Email
    *   New password
2. authHandler.resetPassword finalizes password reset in Cognito or dev-shim.
3. User redirected to `/log-in`.
## Confirm Email Flow
1. User clicks link.
2. authHandler.confirmEmail validates code.
3. User may proceed to login or onboarding.
## Dashboard Flow (Dependency Checked)
1. User navigates to `/dashboard`.
2. Route guard runs:
    *   Logged in? If not → `/log-in`.
    *   Role supported? If not → error.
    *   onboardingStep1Passed ? If false → `/sign-up/onboarding`.
    *   onboardingCompleted (creator only)? If false → `/sign-up/onboarding/kyc`.
3. User finally sees dashboard only when all dependencies are satisfied.
# Shimming Roles in Development Mode
## Purpose
The dev shim allows you to instantly test:
*   Role-based routing
*   Onboarding logic
*   KYC gating
*   Dashboard access
*   Without using Cognito or real accounts.
## Steps to Shim a Role
### 1\. Ensure Dev Shim Is Enabled
In `.env.development`:

```bash
VITE_AUTH_DEV_SHIM=true
```

### 2\. Switch to Dev Handler at Runtime
In browser console:

```dart
window.APP.useAuthHandler("dev");
```

### 3\. Set a Mock Role

```dart
window.APP.setMockRole("creator");
```

This sets:
*   mockUser.role
*   mockUser.raw\["custom:role"\]
### 4\. Control Onboarding Flags

```dart
window.APP.mockUser.onboardingPassed = false;window.APP.mockUser.kycPassed = false;
```

### 5\. Login Using Dev Credentials
Log in normally → the dev shim emits tokens with the mocked role + attributes.
### 6\. Test Dependency Behavior
*   New creator → redirected to `/sign-up/onboarding`.
*   Creator with onboardingPassed only → redirected to `/sign-up/onboarding/kyc`.
*   Fully verified creator → goes directly to `/dashboard`.
This allows complete simulation of all onboarding and KYC flows without using AWS.