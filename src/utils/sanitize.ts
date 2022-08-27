export function sanitize(name: string) {
  return name.replace(/[^a-z0-9-_]/gi, '_')
}
