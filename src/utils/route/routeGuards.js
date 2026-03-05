/**
 * RouteGuards - Navigation guard implementations
 *
 * **CRITICAL**: Every guard operation tracked with global window.performanceTracker.
 * Guards determine if navigation should proceed, redirect, or abort.
 *
 * Guard execution order:
 * 1. Loop prevention
 * 2. Enabled check
 * 3. Authentication check
 * 4. Role check
 * 5. Dependency check
 */

import { log } from "../common/logHandler.js";
import { safelyGetNestedProperty } from "../common/objectSafety.js";
import {
  getDefaultLoginSlug,
  getDefaultNotFoundSlug,
  getDefaultDashboardSlug,
} from "./routeDefaults.js";

// Navigation history for loop detection
const navigationHistory = [];
const MAX_NAVIGATION_HISTORY = 50;

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

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: "guardChainStart",
        file: "routeGuards.js",
        method: "runAllRouteGuards",
        flag: "guard-start",
        purpose: `Begin guard chain for ${toRoute?.slug}`,
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

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

    // 2. Check if route is enabled
    const enabledGuard = guardCheckRouteEnabled(toRoute);
    if (!enabledGuard.allow) {
      log(
        "routeGuards.js",
        "runAllRouteGuards",
        "block",
        "Navigation blocked by enabled guard",
        enabledGuard,
      );
      return enabledGuard;
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

    // 4. Check role requirements
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

    // 5. Check dependencies (onboarding, KYC, etc.)
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
    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: "guardChainComplete",
          file: "routeGuards.js",
          method: "runAllRouteGuards",
          flag: "guard-complete",
          purpose: `Guard chain result: ALLOW`,
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log(
      "routeGuards.js",
      "runAllRouteGuards",
      "return",
      "Guard chain completed, navigation allowed",
      guardResult,
    );
    return guardResult;
  } catch (error) {
    log(
      "routeGuards.js",
      "runAllRouteGuards",
      "error",
      "Guard chain execution failed",
      {
        error: error.message,
        stack: error.stack,
      },
    );

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: "guardChainError",
          file: "routeGuards.js",
          method: "runAllRouteGuards",
          flag: "error",
          purpose: "Guard chain failed with exception",
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log(
      "routeGuards.js",
      "runAllRouteGuards",
      "return",
      "Returning fallback notFound redirect",
      { error: error.message },
    );
    return {
      allow: false,
      redirectTo: getDefaultNotFoundSlug(),
      reason: "Guard execution failed",
    };
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

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: "guardLoopCheck",
        file: "routeGuards.js",
        method: "guardPreventNavigationLoop",
        flag: "loop-detection",
        purpose: "Check for navigation loops",
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

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

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: "loopDetected",
          file: "routeGuards.js",
          method: "guardPreventNavigationLoop",
          flag: "loop-found",
          purpose: `Loop detected for path: ${toRoute?.slug}`,
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

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
 * Check if route is enabled
 * Disabled routes should return 404
 *
 * @param {object} route - Route to check
 * @returns {object} - Guard result
 */
export function guardCheckRouteEnabled(route) {
  log(
    "routeGuards.js",
    "guardCheckRouteEnabled",
    "start",
    "Checking if route is enabled",
    {
      slug: route?.slug,
      enabled: route?.enabled,
    },
  );

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: "guardEnabledCheck",
        file: "routeGuards.js",
        method: "guardCheckRouteEnabled",
        flag: "enabled-check",
        purpose: "Check if route is enabled",
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  // Routes are enabled by default
  if (route.enabled === false) {
    log(
      "routeGuards.js",
      "guardCheckRouteEnabled",
      "warn",
      "Route is disabled",
      { slug: route.slug },
    );

    const result = {
      allow: false,
      redirectTo: getDefaultNotFoundSlug(),
      reason: "Route is disabled",
    };

    log(
      "routeGuards.js",
      "guardCheckRouteEnabled",
      "return",
      "Returning disabled route block",
      result,
    );
    return result;
  }

  const result = { allow: true, redirectTo: null, reason: "Route is enabled" };
  log(
    "routeGuards.js",
    "guardCheckRouteEnabled",
    "return",
    "Route is enabled",
    result,
  );
  return result;
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

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: "guardAuthCheck",
        file: "routeGuards.js",
        method: "guardCheckAuthentication",
        flag: "auth-check",
        purpose: "Check authentication requirements",
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

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

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: "guardRoleCheck",
        file: "routeGuards.js",
        method: "guardCheckUserRole",
        flag: "role-check",
        purpose: "Check user role permissions",
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  // If no role requirements, allow access
  if (!route.supportedRoles || route.supportedRoles.length === 0) {
    const result = {
      allow: true,
      redirectTo: null,
      reason: "No role restrictions",
    };
    log(
      "routeGuards.js",
      "guardCheckUserRole",
      "return",
      "No role restrictions",
      result,
    );
    return result;
  }

  // Check for "all" roles
  if (
    route.supportedRoles.includes("all") ||
    route.supportedRoles.includes("any")
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

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: "guardDependencyCheck",
        file: "routeGuards.js",
        method: "guardCheckDependencies",
        flag: "dependency-check",
        purpose: "Check route dependencies",
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

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
    // Check each dependency in order
    // For creators, we check onboardingPassed first, then kycPassed
    // This ensures proper redirect flow: onboarding -> kyc -> dashboard
    for (const [depKey, depConfig] of Object.entries(roleDependencies)) {
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

/**
 * Clear navigation history
 * Useful for testing or after logout
 *
 * @returns {void}
 */
export function clearNavigationHistory() {
  log(
    "routeGuards.js",
    "clearNavigationHistory",
    "info",
    "Navigation history cleared",
    { previousLength: navigationHistory.length },
  );
  navigationHistory.length = 0;
  log("routeGuards.js", "clearNavigationHistory", "return", "History cleared", {
    newLength: 0,
  });
}
