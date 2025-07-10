export function extractQuery(text: string): string | null {
  const match = text.trim().match(/^query:\s*<(.+)>$/i)
  return match ? `/${match[1]}` : null
}
