export function isDashboardMenuItemActive(item, currentRoute) {
  if (!item || !item.route || !currentRoute) return false;

  const path = currentRoute.path;
  const itemRoute = item.route;

  // Exact match config if provided
  if (item.activeMatch === 'exact') {
    return path === itemRoute;
  }

  // Exact match for dashboard home
  if (itemRoute === '/dashboard' || itemRoute === '/dashboard/') {
    return path === '/dashboard' || path === '/dashboard/';
  }

  // Default prefix match
  return path.startsWith(itemRoute);
}
