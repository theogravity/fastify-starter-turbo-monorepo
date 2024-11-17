export function removeQueryParametersFromPath(path: string): string {
  // If the path includes a '?' character, split and return the first part
  // Otherwise, return the path as is
  return path.split("?")[0];
}
