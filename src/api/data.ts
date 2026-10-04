export function asList<T>(payload: unknown, ...keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (!payload || typeof payload !== "object") return []
  const record = payload as Record<string, unknown>
  for (const key of [...keys, "results", "data"]) {
    const value = record[key]
    if (Array.isArray(value)) return value as T[]
  }
  return []
}

export function asRecord<T>(payload: unknown, key?: string): T {
  if (payload && typeof payload === "object" && key) {
    return ((payload as Record<string, unknown>)[key] ?? payload) as T
  }
  return payload as T
}
