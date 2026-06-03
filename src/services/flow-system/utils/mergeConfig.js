export function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function mergeConfig(baseConfig, overrideConfig) {
  if (!isPlainObject(baseConfig) || !isPlainObject(overrideConfig)) {
    return overrideConfig === undefined ? baseConfig : overrideConfig;
  }

  const merged = { ...baseConfig };
  Object.entries(overrideConfig).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(baseConfig[key])) {
      merged[key] = mergeConfig(baseConfig[key], value);
      return;
    }
    merged[key] = value;
  });
  return merged;
}
