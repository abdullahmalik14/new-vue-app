/**
 * RouteGuards - Navigation guard implementations
 *
 * **CRITICAL**: Every guard operation tracked via trackStep() (SSR-safe performanceTracker access).
 * Guards determine if navigation should proceed, redirect, or abort.
 *
 * Guard execution order:
 * 1. Loop prevention
 * 2. Environment access (envAccess — defense in depth; see S1)
 * 3. Authentication check
 * 4. Admin-only check (adminOnly — M11)
 * 5. Role check
 * 6. Dependency check
 *
 * Note (B3): `enabled: false` routes are excluded in `generateRoutesFromConfig`.
 * They never reach the guard chain — direct URLs fall through to the catch-all → /404.
 */

import { log } from "../common/logHandler.js";
import { trackStep } from "../common/performanceTrackerAccess.js";
import { reportApplicationError } from "../common/errorHandler.js";
import { safelyGetNestedProperty } from "../common/objectSafety.js";
import {
  getDefaultLoginSlug,
  getDefaultNotFoundSlug,
  getDefaultGuardErrorSlug,
  getDefaultDashboardSlug,
} from "./routeDefaults.js";
import { isRouteAccessibleInCurrentEnvironment } from "./routeEnvAccess.js";
import { isRouteAccessibleToAdmin } from "./routeAdminAccess.js";

// Navigation history for loop detection
const navigationHistory = [];
const MAX_NAVIGATION_HISTORY = 50;

/** Creator onboarding flow order — earlier deps must pass before later redirectIfComplete */
const ORDERED_DEPENDENCY_KEYS = ["onboardingPassed", "kycPassed"];

/**
 * @param {Record<string, object>} roleDependencies
 * @returns {[string, object][]}
 */
function getOrderedRoleDependencyEntries(roleDependencies) {
  return Object.entries(roleDependencies).sort(([keyA], [keyB]) => {
    const rankA = ORDERED_DEPENDENCY_KEYS.indexOf(keyA);
    const rankB = ORDERED_DEPENDENCY_KEYS.indexOf(keyB);
    const orderA = rankA === -1 ? ORDERED_DEPENDENCY_KEYS.length : rankA;
    const orderB = rankB === -1 ? ORDERED_DEPENDENCY_KEYS.length : rankB;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return 0;
  });
}

/**
 * redirectIfComplete on kycPassed must not skip an incomplete onboardingPassed step.
 *
 * @param {string} depKey
 * @param {Record<string, object>} roleDependencies
 * @param {object} userProfile
 * @returns {boolean}
 */
function arePrerequisiteDependenciesMet(depKey, roleDependencies, userProfile) {
  const orderedKeys = getOrderedRoleDependencyEntries(roleDependencies).map(
    ([key]) => key,
  );
  const depIndex = orderedKeys.indexOf(depKey);

  if (depIndex <= 0) {
    return true;
  }

  for (let i = 0; i < depIndex; i++) {
    const prereqKey = orderedKeys[i];
    if (!roleDependencies[prereqKey]) {
      continue;
    }
    if (userProfile[prereqKey] !== true) {
      return false;
    }
  }

  return true;
}

/**
 * Run all route guards in sequence
 * **CRITICAL**: Wraps entire guard chain with perfTracker
 *
 * @param {object} toRoute - Target route object
 * @param {object} fromRoute - Current route object
 * @param {object} context - Additional context (user, auth state, etc.)
 * @returns {object} - Guard result { allow: boolean, redirectTo: string|null, reason: string }
 */
export async function runAllRouteGuards(toRoute, fromRoute, context = {}) {
  log("routeGuards.js", "runAllRouteGuards", "start", "Starting guard chain", {
    toPath: toRoute?.slug,
    fromPath: fromRoute?.slug,
  });
  trackStep({
        step: "guardChainStart",
        file: "routeGuards.js",
        method: "runAllRouteGuards",
        flag: "guard-start",
        purpose: `Begin guard chain for ${toRoute?.slug}`,
      });

  try {
    // Execute guards in order

    // 1. Check for navigation loops
    const loopGuard = guardPreventNavigationLoop(toRoute, fromRoute);
    if (!loopGuard.allow) {
      log(
        "routeGuards.js",
        "runAllRouteGuards",
        "block",
        "Navigation blocked by loop guard",
        loopGuard,
      );
      return loopGuard;
    }

    // 2. Check environment access (envAccess only — enabled: false handled at route generation)
    const envGuard = guardCheckRouteEnvironmentAccess(toRoute);
    if (!envGuard.allow) {
      log(
        "routeGuards.js",
        "runAllRouteGuards",
        "block",
        "Navigation blocked by environment guard",
        envGuard,
      );
      return envGuard;
    }

    // 3. Check authentication requirements
    const authGuard = guardCheckAuthentication(toRoute, context);
    if (!authGuard.allow) {
      log(
        "routeGuards.js",
        "runAllRouteGuards",
        "block",
        "Navigation blocked by auth guard",
        authGuard,
      );
      return authGuard;
    }

    // 4. Check admin-only routes (M11)
    const adminGuard = guardCheckRouteAdminAccess(toRoute, context);
    if (!adminGuard.allow) {
      log(
        "routeGuards.js",
        "runAllRouteGuards",
        "block",
        "Navigation blocked by admin guard",
        adminGuard,
      );
      return adminGuard;
    }

    // 5. Check role requirements
    const roleGuard = guardCheckUserRole(toRoute, context);
    if (!roleGuard.allow) {
      log(
        "routeGuards.js",
        "runAllRouteGuards",
        "block",
        "Navigation blocked by role guard",
        roleGuard,
      );
      return roleGuard;
    }

    // 6. Check dependencies (onboarding, KYC, etc.)
    const dependencyGuard = guardCheckDependencies(toRoute, context);
    if (!dependencyGuard.allow) {
      log(
        "routeGuards.js",
        "runAllRouteGuards",
        "block",
        "Navigation blocked by dependency guard",
        dependencyGuard,
      );
      return dependencyGuard;
    }

    // All guards passed
    const guardResult = {
      allow: true,
      redirectTo: null,
      reason: "All guards passed",
    };

    // Track guard chain completion
  trackStep({
          step: "guardChainComplete",
          file: "routeGuards.js",
          method: "runAllRouteGuards",
          flag: "guard-complete",
          purpose: `Guard chain result: ALLOW`,
        });

    log(
      "routeGuards.js",
      "runAllRouteGuards",
      "return",
      "Guard chain completed, navigation allowed",
      guardResult,
    );
    return guardResult;
  } catch (error) {
    reportApplicationError(
      "routeGuards.js",
      "runAllRouteGuards",
      "Guard chain execution failed",
      error,
      {
        toSlug: toRoute?.slug,
        fromSlug: fromRoute?.slug,
        userRole: context?.userRole,
        isAuthenticated: context?.isAuthenticated,
        errorCode: "GUARD_CHAIN_FAILURE",
      },
    );
  trackStep({
          step: "guardChainError",
          file: "routeGuards.js",
          method: "runAllRouteGuards",
          flag: "error",
          purpose: "Guard chain failed with exception",
        });

    const guardErrorResult = {
      allow: false,
      redirectTo: getDefaultGuardErrorSlug(),
      reason: "Guard execution failed",
      errorCode: "GUARD_CHAIN_FAILURE",
    };

    log(
      "routeGuards.js",
      "runAllRouteGuards",
      "return",
      "Returning guard error redirect after exception",
      guardErrorResult,
    );
    return guardErrorResult;
  }
}

/**
 * Prevent navigation loops
 * Detects if user is being redirected in circles
 *
 * @param {object} toRoute - Target route
 * @param {object} fromRoute - Current route
 * @returns {object} - Guard result
 */
export function guardPreventNavigationLoop(toRoute, fromRoute) {
  log(
    "routeGuards.js",
    "guardPreventNavigationLoop",
    "start",
    "Checking for navigation loops",
    {
      toPath: toRoute?.slug,
      fromPath: fromRoute?.slug,
    },
  );
  trackStep({
        step: "guardLoopCheck",
        file: "routeGuards.js",
        method: "guardPreventNavigationLoop",
        flag: "loop-detection",
        purpose: "Check for navigation loops",
      });

  // Only consider loops when the router is trying to go to the same path again
  // This prevents false positives from legitimate user navigation between different pages
  if (toRoute?.slug !== fromRoute?.slug) {
    const result = {
      allow: true,
      redirectTo: null,
      reason: "No loop – different path",
    };
    log(
      "routeGuards.js",
      "guardPreventNavigationLoop",
      "return",
      "No loop – different path",
      result,
    );
    return result;
  }

  // Track only attempts where to === from (actual redirect loops)
  navigationHistory.push({
    path: toRoute?.slug,
    timestamp: Date.now(),
  });

  // Trim history to max size
  if (navigationHistory.length > MAX_NAVIGATION_HISTORY) {
    navigationHistory.shift();
  }

  // Check for repeated navigation to same path
  const recentNavigations = navigationHistory.slice(-5);
  const repeatedPath = recentNavigations.filter(
    (nav) => nav.path === toRoute?.slug,
  );

  if (repeatedPath.length >= 3) {
    log(
      "routeGuards.js",
      "guardPreventNavigationLoop",
      "warn",
      "Navigation loop detected",
      {
        path: toRoute?.slug,
        count: repeatedPath.length,
      },
    );
  trackStep({
          step: "loopDetected",
          file: "routeGuards.js",
          method: "guardPreventNavigationLoop",
          flag: "loop-found",
          purpose: `Loop detected for path: ${toRoute?.slug}`,
        });

    const result = {
      allow: false,
      redirectTo: getDefaultNotFoundSlug(),
      reason: "Navigation loop detected",
    };

    log(
      "routeGuards.js",
      "guardPreventNavigationLoop",
      "return",
      "Returning loop block result",
      result,
    );
    return result;
  }

  // No loop detected
  const result = { allow: true, redirectTo: null, reason: "No loop detected" };
  log(
    "routeGuards.js",
    "guardPreventNavigationLoop",
    "return",
    "No loop detected",
    result,
  );
  return result;
}

/**
 * Check route environment access (envAccess).
 * Defense in depth for dev-only routes that were registered (S1).
 *
 * `enabled: false` is NOT checked here — those routes are omitted in
 * `generateRoutesFromConfig` and unreachable URLs hit the catch-all → /404 (B3).
 *
 * @param {object} route - Route to check
 * @returns {object} - Guard result
 */
export function guardCheckRouteEnvironmentAccess(route) {
  log(
    "routeGuards.js",
    "guardCheckRouteEnvironmentAccess",
    "start",
    "Checking route environment access",
    {
      slug: route?.slug,
      envAccess: route?.envAccess,
    },
  );
  trackStep({
        step: "guardEnvAccessCheck",
        file: "routeGuards.js",
        method: "guardCheckRouteEnvironmentAccess",
        flag: "env-access-check",
        purpose: "Check route envAccess availability",
      });

  if (!isRouteAccessibleInCurrentEnvironment(route)) {
    log(
      "routeGuards.js",
      "guardCheckRouteEnvironmentAccess",
      "warn",
      "Route is not available in this environment",
      { slug: route.slug, envAccess: route.envAccess },
    );

    const result = {
      allow: false,
      redirectTo: getDefaultNotFoundSlug(),
      reason: "Route not available in this environment",
    };

    log(
      "routeGuards.js",
      "guardCheckRouteEnvironmentAccess",
      "return",
      "Returning environment block",
      result,
    );
    return result;
  }

  const result = {
    allow: true,
    redirectTo: null,
    reason: "Route available in this environment",
  };
  log(
    "routeGuards.js",
    "guardCheckRouteEnvironmentAccess",
    "return",
    "Route environment check passed",
    result,
  );
  return result;
}

/** @deprecated Use guardCheckRouteEnvironmentAccess — enabled flag is handled at route generation (B3). */
export function guardCheckRouteEnabled(route) {
  return guardCheckRouteEnvironmentAccess(route);
}

/**
 * Check authentication requirements
 * Verifies if user is authenticated when route requires it
 *
 * @param {object} route - Route to check
 * @param {object} context - Context with user and auth state
 * @returns {object} - Guard result
 */
export function guardCheckAuthentication(route, context) {
  log(
    "routeGuards.js",
    "guardCheckAuthentication",
    "start",
    "Checking authentication requirements",
    {
      slug: route?.slug,
      requiresAuth: route?.requiresAuth,
      isAuthenticated: context?.isAuthenticated,
    },
  );
  trackStep({
        step: "guardAuthCheck",
        file: "routeGuards.js",
        method: "guardCheckAuthentication",
        flag: "auth-check",
        purpose: "Check authentication requirements",
      });

  // Check if route requires authentication
  if (route.requiresAuth === true) {
    // User must be authenticated
    if (!context.isAuthenticated) {
      log(
        "routeGuards.js",
        "guardCheckAuthentication",
        "warn",
        "Authentication required but user not authenticated",
        {
          slug: route.slug,
        },
      );

      // Redirect to login or specified path
      const redirectPath = route.redirectIfNotAuth || getDefaultLoginSlug();

      const result = {
        allow: false,
        redirectTo: redirectPath,
        reason: "Authentication required",
      };

      log(
        "routeGuards.js",
        "guardCheckAuthentication",
        "return",
        "Returning auth required block",
        result,
      );
      return result;
    }
  }

  // Check if authenticated users should be redirected away (e.g., login page)
  if (route.redirectIfLoggedIn && context.isAuthenticated) {
    log(
      "routeGuards.js",
      "guardCheckAuthentication",
      "info",
      "Authenticated user accessing login page, redirecting",
      {
        slug: route.slug,
        redirectTo: route.redirectIfLoggedIn,
      },
    );

    const result = {
      allow: false,
      redirectTo: route.redirectIfLoggedIn,
      reason: "Already authenticated",
    };

    log(
      "routeGuards.js",
      "guardCheckAuthentication",
      "return",
      "Returning already authenticated redirect",
      result,
    );
    return result;
  }

  const result = {
    allow: true,
    redirectTo: null,
    reason: "Authentication check passed",
  };
  log(
    "routeGuards.js",
    "guardCheckAuthentication",
    "return",
    "Authentication check passed",
    result,
  );
  return result;
}

/**
 * Block routes marked adminOnly when the user is not an admin (M11).
 *
 * @param {object} route
 * @param {object} context
 * @returns {object}
 */
export function guardCheckRouteAdminAccess(route, context) {
  log("routeGuards.js", "guardCheckRouteAdminAccess", "start", "Checking admin-only route access", {
    slug: route?.slug,
    adminOnly: route?.adminOnly,
    userRole: context?.userRole,
  });
  trackStep({
    step: "guardAdminAccessCheck",
    file: "routeGuards.js",
    method: "guardCheckRouteAdminAccess",
    flag: "admin-access-check",
    purpose: "Check route adminOnly restriction",
  });

  if (!isRouteAccessibleToAdmin(route, context)) {
    const result = {
      allow: false,
      redirectTo: getDefaultNotFoundSlug(),
      reason: "Route requires admin access",
    };
    log("routeGuards.js", "guardCheckRouteAdminAccess", "return", "Returning admin block", result);
    return result;
  }

  const result = {
    allow: true,
    redirectTo: null,
    reason: "Admin access check passed",
  };
  log("routeGuards.js", "guardCheckRouteAdminAccess", "return", "Admin access check passed", result);
  return result;
}

/**
 * Check user role requirements
 * Verifies if user's role is allowed to access route
 *
 * @param {object} route - Route to check
 * @param {object} context - Context with user role
 * @returns {object} - Guard result
 */
export function guardCheckUserRole(route, context) {
  log(
    "routeGuards.js",
    "guardCheckUserRole",
    "start",
    "Checking user role requirements",
    {
      slug: route?.slug,
      supportedRoles: route?.supportedRoles,
      userRole: context?.userRole,
    },
  );
  trackStep({
        step: "guardRoleCheck",
        file: "routeGuards.js",
        method: "guardCheckUserRole",
        flag: "role-check",
        purpose: "Check user role permissions",
      });

  // Open to all roles — config should use [\"all\"] (B4); empty/omitted still allowed at runtime
  if (
    !route.supportedRoles ||
    route.supportedRoles.length === 0 ||
    route.supportedRoles.includes("all")
  ) {
    const result = {
      allow: true,
      redirectTo: null,
      reason: "Route allows all roles",
    };
    log(
      "routeGuards.js",
      "guardCheckUserRole",
      "return",
      "Route allows all roles",
      result,
    );
    return result;
  }

  // Use role from userProfile if available, fallback to context.userRole
  // This handles cases where the local state has role but the token doesn't yet
  // (e.g., immediately after onboarding before token fully propagates)
  const userProfile = context.userProfile || {};
  const userRole = userProfile.role || context.userRole || "guest";

  log(
    "routeGuards.js",
    "guardCheckUserRole",
    "role-resolution",
    "Resolved user role",
    {
      slug: route.slug,
      contextUserRole: context.userRole,
      profileRole: userProfile.role,
      resolvedUserRole: userRole,
      supportedRoles: route.supportedRoles,
    },
  );

  if (!route.supportedRoles.includes(userRole)) {
    log(
      "routeGuards.js",
      "guardCheckUserRole",
      "warn",
      "User role not authorized for route",
      {
        slug: route.slug,
        userRole,
        supportedRoles: route.supportedRoles,
      },
    );

    // If user is authenticated but has no role (guest), they likely need to complete onboarding
    // Redirect to onboarding instead of 404 for better UX
    if (context.isAuthenticated && userRole === "guest") {
      log(
        "routeGuards.js",
        "guardCheckUserRole",
        "info",
        "Authenticated user without role, redirecting to onboarding",
        {
          slug: route.slug,
        },
      );

      const result = {
        allow: false,
        redirectTo: "/sign-up/onboarding",
        reason: "User needs to complete onboarding to get role",
      };

      log(
        "routeGuards.js",
        "guardCheckUserRole",
        "return",
        "Returning redirect to onboarding",
        result,
      );
      return result;
    }

    // If route has dependencies configured for this role, let dependency check handle redirect
    // This allows routes like KYC to redirect non-creators to dashboard via dependencies
    if (route.dependencies?.roles?.[userRole]) {
      log(
        "routeGuards.js",
        "guardCheckUserRole",
        "info",
        "Route has dependencies for this role, allowing through to dependency check",
        {
          slug: route.slug,
          userRole,
        },
      );

      const result = {
        allow: true,
        redirectTo: null,
        reason: "Allowing through to dependency check",
      };
      log(
        "routeGuards.js",
        "guardCheckUserRole",
        "return",
        "Allowing through to dependency check",
        result,
      );
      return result;
    }

    const result = {
      allow: false,
      redirectTo: getDefaultNotFoundSlug(),
      reason: `Role ${userRole} not authorized`,
    };

    log(
      "routeGuards.js",
      "guardCheckUserRole",
      "return",
      "Returning role not authorized block",
      result,
    );
    return result;
  }

  const result = { allow: true, redirectTo: null, reason: "Role check passed" };
  log(
    "routeGuards.js",
    "guardCheckUserRole",
    "return",
    "Role check passed",
    result,
  );
  return result;
}

/**
 * Check route dependencies (onboarding, KYC, etc.)
 * Verifies user has completed required steps
 *
 * @param {object} route - Route to check
 * @param {object} context - Context with user profile
 * @returns {object} - Guard result
 */
export function guardCheckDependencies(route, context) {
  log(
    "routeGuards.js",
    "guardCheckDependencies",
    "start",
    "Checking route dependencies",
    {
      slug: route?.slug,
      hasDependencies: !!route?.dependencies,
    },
  );
  trackStep({
        step: "guardDependencyCheck",
        file: "routeGuards.js",
        method: "guardCheckDependencies",
        flag: "dependency-check",
        purpose: "Check route dependencies",
      });

  // If no dependencies, allow access
  if (!route.dependencies) {
    const result = { allow: true, redirectTo: null, reason: "No dependencies" };
    log(
      "routeGuards.js",
      "guardCheckDependencies",
      "return",
      "No dependencies",
      result,
    );
    return result;
  }

  // If route doesn't require auth and user is a guest, skip dependencies
  if (route.requiresAuth === false && !context.isAuthenticated) {
    const result = {
      allow: true,
      redirectTo: null,
      reason: "Guest on public route",
    };
    log(
      "routeGuards.js",
      "guardCheckDependencies",
      "return",
      "Skipping dependencies for guest on public route",
      result,
    );
    return result;
  }

  const userProfile = context.userProfile || {};

  // Use role from userProfile if available, fallback to context.userRole
  // This handles cases where the local state has role but the token doesn't yet
  // (e.g., immediately after onboarding before token fully propagates)
  const userRole = userProfile.role || context.userRole || "guest";

  // Log user profile state for debugging
  log(
    "routeGuards.js",
    "guardCheckDependencies",
    "user-profile",
    "User profile state",
    {
      slug: route.slug,
      contextUserRole: context.userRole,
      profileRole: userProfile.role,
      resolvedUserRole: userRole,
      userProfile: {
        onboardingPassed: userProfile.onboardingPassed,
        kycPassed: userProfile.kycPassed,
        role: userProfile.role,
      },
    },
  );

  // Check role-specific dependencies
  const roleDependencies = safelyGetNestedProperty(
    route.dependencies,
    `roles.${userRole}`,
  );

  log(
    "routeGuards.js",
    "guardCheckDependencies",
    "role-deps",
    "Role dependencies found",
    {
      slug: route.slug,
      userRole,
      hasRoleDependencies: !!roleDependencies,
      roleDependencies: roleDependencies ? Object.keys(roleDependencies) : [],
    },
  );

  if (roleDependencies) {
    // Check each dependency in onboarding flow order (onboardingPassed before kycPassed)
    for (const [depKey, depConfig] of getOrderedRoleDependencyEntries(
      roleDependencies,
    )) {
      const isRequired = depConfig.required === true;
      const redirectIfComplete = depConfig.redirectIfComplete === true;
      const fallbackSlug = depConfig.fallbackSlug;

      // Skip if neither required nor inverse check
      if (!isRequired && !redirectIfComplete) {
        continue;
      }

      // Check if user meets this dependency - explicitly check for true
      // Treat undefined, false, null, or any non-true value as missing
      const userValue = userProfile[depKey];
      const userHasDependency = userValue === true;

      log(
        "routeGuards.js",
        "guardCheckDependencies",
        "dependency-check",
        "Checking role-specific dependency",
        {
          slug: route.slug,
          userRole,
          dependency: depKey,
          isRequired,
          redirectIfComplete,
          userValue,
          userValueType: typeof userValue,
          userHasDependency,
          fallbackSlug,
        },
      );

      // Handle inverse check: redirect if dependency IS met
      // Used for routes like onboarding that should redirect if already completed
      if (redirectIfComplete && userHasDependency) {
        if (
          !arePrerequisiteDependenciesMet(depKey, roleDependencies, userProfile)
        ) {
          log(
            "routeGuards.js",
            "guardCheckDependencies",
            "info",
            "Skipping redirectIfComplete — prerequisite dependency incomplete",
            {
              slug: route.slug,
              userRole,
              dependency: depKey,
              userValue,
            },
          );
          continue;
        }

        log(
          "routeGuards.js",
          "guardCheckDependencies",
          "info",
          "Dependency already complete, redirecting",
          {
            slug: route.slug,
            userRole,
            dependency: depKey,
            userValue,
            fallbackSlug,
          },
        );

        const result = {
          allow: false,
          redirectTo: fallbackSlug || getDefaultDashboardSlug(),
          reason: `Dependency already complete: ${depKey}`,
        };

        log(
          "routeGuards.js",
          "guardCheckDependencies",
          "return",
          "Returning redirect for completed dependency",
          result,
        );
        return result;
      }

      // Handle normal check: redirect if dependency is missing
      // If dependency is required and user doesn't have it, block and redirect
      // This handles: undefined, false, null, or any non-true value
      if (isRequired && !userHasDependency) {
        log(
          "routeGuards.js",
          "guardCheckDependencies",
          "warn",
          "User missing required dependency",
          {
            slug: route.slug,
            userRole,
            dependency: depKey,
            userValue,
            userValueType: typeof userValue,
            fallbackSlug,
          },
        );

        const result = {
          allow: false,
          redirectTo: fallbackSlug || getDefaultDashboardSlug(),
          reason: `Missing required dependency: ${depKey}`,
        };

        log(
          "routeGuards.js",
          "guardCheckDependencies",
          "return",
          "Returning missing dependency block",
          result,
        );
        return result;
      }
    }
  }

  // Block roles not listed in supportedRoles after dependency redirects are evaluated (L6).
  // Role guard may allow non-listed roles through when dependencies.roles[userRole] exists
  // so redirectIfComplete / required checks can run; if none fired, deny access here.
  const supportedRoles = route.supportedRoles;
  const hasRoleRestrictions =
    supportedRoles?.length > 0 &&
    !supportedRoles.includes("all");

  if (hasRoleRestrictions && !supportedRoles.includes(userRole)) {
    log(
      "routeGuards.js",
      "guardCheckDependencies",
      "warn",
      "Role not in supportedRoles after dependency check",
      {
        slug: route.slug,
        userRole,
        supportedRoles,
      },
    );

    const result = {
      allow: false,
      redirectTo: getDefaultNotFoundSlug(),
      reason: `Role ${userRole} not authorized for route`,
    };

    log(
      "routeGuards.js",
      "guardCheckDependencies",
      "return",
      "Returning unsupported role block after dependencies",
      result,
    );
    return result;
  }

  // Check general dependencies (not role-specific)
  if (route.dependencies.onboardingRequired) {
    const onboardingComplete = userProfile.onboardingPassed === true;

    if (!onboardingComplete) {
      const fallbackSlug = safelyGetNestedProperty(
        route.dependencies,
        "onboardingRequired.fallbackSlug",
        "/sign-up/onboarding",
      );

      log(
        "routeGuards.js",
        "guardCheckDependencies",
        "warn",
        "Onboarding required but not completed",
        {
          slug: route.slug,
          fallbackSlug,
        },
      );

      const result = {
        allow: false,
        redirectTo: fallbackSlug,
        reason: "Onboarding not completed",
      };

      log(
        "routeGuards.js",
        "guardCheckDependencies",
        "return",
        "Returning onboarding required block",
        result,
      );
      return result;
    }
  }

  const result = {
    allow: true,
    redirectTo: null,
    reason: "All dependencies met",
  };
  log(
    "routeGuards.js",
    "guardCheckDependencies",
    "return",
    "All dependencies met",
    result,
  );
  return result;
}

/** Set when beforeEach ends navigation via next(location) (locale inject or guard redirect). */
let guardRedirectNavigationPending = false;

/**
 * Mark navigation as ending via a route-guard redirect (auth, dependency, etc.).
 * Do not call for locale-inject redirects — those are user navigation normalization (L5).
 *
 * @returns {void}
 */
export function markGuardRedirectNavigation() {
  guardRedirectNavigationPending = true;
  log("routeGuards.js", "markGuardRedirectNavigation", "info", "Guard redirect flagged", {});
}

/**
 * @returns {boolean} True if the completed navigation followed a guard/locale redirect.
 */
export function consumeGuardRedirectNavigation() {
  const wasRedirect = guardRedirectNavigationPending;
  guardRedirectNavigationPending = false;
  log("routeGuards.js", "consumeGuardRedirectNavigation", "return", "Guard redirect flag consumed", {
    wasRedirect,
  });
  return wasRedirect;
}

/**
 * Whether afterEach should clear loop-detection history (L5).
 *
 * @param {string} fromPath
 * @param {string} toPath
 * @param {{ completedViaGuardRedirect?: boolean }} [options]
 * @returns {boolean}
 */
export function shouldClearGuardLoopHistoryAfterNavigation(
  fromPath,
  toPath,
  { completedViaGuardRedirect = false } = {},
) {
  if (completedViaGuardRedirect) {
    return false;
  }
  if (!fromPath) {
    return false;
  }
  return toPath !== fromPath;
}

/**
 * Clear guard redirect-loop detection history (not full navigation state).
 * Used by router afterEach on user-initiated route changes (L5) and in tests/logout flows.
 *
 * @returns {void}
 */
export function clearGuardNavigationHistory() {
  log(
    "routeGuards.js",
    "clearGuardNavigationHistory",
    "info",
    "Guard navigation history cleared",
    { previousLength: navigationHistory.length },
  );
  navigationHistory.length = 0;
  log("routeGuards.js", "clearGuardNavigationHistory", "return", "History cleared", {
    newLength: 0,
  });
}
