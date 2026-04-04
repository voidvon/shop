export function readAppVersion() {
  if (typeof Version === 'string' && Version.trim()) {
    return Version.trim()
  }

  return 'dev'
}
