# Authentication Overview

The authentication system provides a unified interface for logging in, signing up, managing sessions, and retrieving the current user. It abstracts two possible backends:
1. A full AWS Cognito implementation for production.
2. A development shim that simulates login, roles, attributes, and tokens without any AWS dependency.

At runtime, the app chooses the correct engine based on environment variables or developer console overrides. The result is a predictable, stable, and testable authentication flow where all parts of the application treat the auth layer the same way, regardless of whether the system is backed by Cognito or by the dev shim.

The system also manages roles, onboarding steps, KYC flags, and persistent sessions so the rest of the application can operate without caring about where the data comes from.
## Terminology
*   Authentication Handler – The active module that processes login, signup, session restore, logout, token refresh, and user metadata operations.
*   Cognito User Pool – An AWS service where real user accounts are created, authenticated, and updated.
*   Dev Shim – A local in-browser mock authentication system that mimics Cognito behavior without contacting any remote service.
*   Session Tokens – Cognito or shim-generated objects containing ID token, access token, and refresh token.
*   Role Shim – The dev-shim logic that injects predefined roles (creator, fan, etc.) so the rest of the app can test role-based behavior without Cognito.
*   User Attributes – Additional fields stored with the user: email\_verified, custom:kyc, onboardingPassed, etc.
*   Callback Flow – The logic used after third-party or Cognito redirects to restore tokens and complete login.
*   Session Restoration – Reconstructing the user from the stored session on page load.
## High-Level Behavior
When the application starts, it selects one of two authentication handlers: the Cognito handler (production) or the dev shim handler (development). All authentication calls (login, signup, logout, restoreSession, updateProfileAttributes, refreshToken) are routed through this active handler. The handler produces a normalized user object that the rest of the system relies upon.

On page load, the handler attempts to restore a previous session. Navigation or components requiring authentication pull the current user from the active session. Logout clears stored tokens and removes all identity information. Role checks are handled inside the user object returned by the handler.
## System Parts (Modules)
1. authHandler.js — the runtime selector that exposes the unified authentication interface.
2. awsCognitoHandler.js — real Cognito logic for production authentication.
3. authHandlerDev.js — mock authentication engine used in development mode.
4. awsCognitoUtilities.js — low-level Cognito SDK wrappers for creating users, sessions, attributes, and tokens.
5. UI auth components — Login, Signup, Reset Password pages that call the handler functions.
### authHandler.js – Responsibilities
*   Detect active mode based on VITE\_AUTH\_DEV\_SHIM.
*   Export a ready-to-use authentication API.
*   Allow runtime switching using window.APP.useAuthHandler().
*   Expose diagnostics and logs.
*   Proxy all auth operations to the currently active handler.
### awsCognitoHandler.js – Responsibilities
*   Create new Cognito users.
*   Authenticate using Cognito’s AuthenticationDetails.
*   Fetch and refresh Cognito tokens.
*   Update user attributes in AWS.
*   Provide a normalized user object from Cognito session.
*   Handle sign-out and session restoration via Cognito SDK.
### authHandlerDev.js – Responsibilities
*   Simulate login and signup entirely in local storage.
*   Provide mock JWT tokens and signatures.
*   Implement a role shim (mockUserRole).
*   Provide kycPassed, onboardingPassed flags for testing flows.
*   Allow fast login and state reset without AWS.
*   Simulate refresh tokens and token expiry windows.
*   Provide updateProfileAttributes for UI testing.
## Data & File Structure
src/utils/auth/
*   authHandler.js – runtime engine selector.
*   authHandlerDev.js – mock authentication provider.
*   awsCognitoHandler.js – high-level Cognito workflows.
*   awsCognitoUtilities.js – low-level Cognito SDK operations.
## Priority / Precedence Rules
1. If VITE\_AUTH\_DEV\_SHIM=true → force dev-shim authentication.
2. If VITE\_AUTH\_DEV\_SHIM=false → use AWS Cognito authentication.
3. If developer calls window.APP.useAuthHandler("dev") → override to dev shim.
4. If developer calls window.APP.useAuthHandler("cognito") → override to Cognito.
5. Fallback: dev-shim if environment variables are missing (development only).
## Runtime Flow / Execution Sequence
1. App starts.
2. envValidator checks whether dev shim or Cognito is required.
3. authHandler.js loads the correct handler.
4. Selected handler runs restoreSession() to load tokens.
5. UI components request current user from the handler.
6. If user signs in:
    *   Cognito handler or dev shim validates credentials.
    *   Session tokens stored.
    *   Callback flow handled when necessary.
7. If user signs out:
    *   Handler clears tokens.
    *   UI updates reflect unauthenticated state.
### On App Startup
*   Validate environment variables.
*   Decide authentication mode.
*   Restore session if tokens exist.
*   Normalize user data for UI.
### On Navigation / State Change
*   Components request current user from handler.
*   If session expired, refreshToken() is attempted.
*   Role-based guards use the normalized user object.
## Configuration & Integration Points
*   .env.development – enables dev shim by default.
*   .env.production – disables dev shim and requires Cognito.
*   VITE\_AUTH\_DEV\_SHIM – core switch for choosing engine.
*   VITE\_COGNITO\_USER\_POOL\_ID – Cognito pool configuration.
*   VITE\_COGNITO\_CLIENT\_ID – Cognito client configuration.
*   VITE\_COGNITO\_REGION – AWS region.
## Checklists
### Checklist – authHandler (selector)
*   Correctly detects dev shim mode.
*   Correctly exposes [window.APP](http://window.APP) helpers.
*   Correctly proxies all operations to active handler.
*   Allows runtime switching safely.
### Checklist – awsCognitoHandler
*   Signup creates Cognito user.
*   Login uses AuthenticationDetails correctly.
*   RefreshToken interacts with Cognito session.
*   Session restoration rehydrates tokens.
*   User attributes normalized and readable.
### Checklist – authHandlerDev
*   Login/Signup fully local.
*   Role shim applied.
*   JWTs signed and validated locally.
*   Session restored from local storage.
## Testing Guide
### Checklist – Dev Shim Mode
Step: Set VITE\_AUTH\_DEV\_SHIM=true and start project.
Expected: No AWS requests; login works with [dev@test.com](mailto:dev@test.com); role shim active.
Step: Call window.APP.getCurrentAuthMode().
Expected: “dev”.
Step: Refresh page.
Expected: Session restored from local storage.
### Checklist – Cognito Mode
Step: Set VITE\_AUTH\_DEV\_SHIM=false with valid Cognito IDs.
Expected: Cognito pool contacted for login.
Step: Sign up a user.
Expected: User created in Cognito console.
Step: Refresh token during long session.
Expected: Token refresh performed via Cognito SDK.
### Checklist – Role Behavior
Step: Login in dev shim.
Expected: mockUser.role returned.
Step: Navigate to protected route.
Expected: Access granted or denied based on role.
## Diagnostics & Developer Tools
*   window.APP.useAuthHandler("dev") – switch to dev auth.
*   window.APP.useAuthHandler("cognito") – switch to Cognito.
*   window.APP.getCurrentAuthMode() – show active mode.
*   window.APP.testAuthToggle() – verify switching logic.
*   log() wrapper – outputs for debugging flows.
## Summary
The authentication system provides a unified interface that hides the complexity of Cognito behind an abstraction layer. In development, the dev shim provides instant, offline, stable authentication with role simulation. In production, the Cognito handler provides secure AWS-backed authentication and user attribute management. The system ensures predictable behavior across startup, navigation, and state changes, and gives developers full diagnostic control through the [window.APP](http://window.APP) API.