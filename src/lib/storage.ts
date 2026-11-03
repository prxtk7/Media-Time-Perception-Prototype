const isBrowser = typeof window !== 'undefined'

export function readFromStorage<T>(key: string): T | null {
  if (!isBrowser) return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch (error) {
    console.warn('Failed to read storage', error)
    return null
  }
}

export function writeToStorage<T>(key: string, value: T) {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to write storage', error)
  }
}

export function clearStorage(key: string) {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear storage', error)
  }
}


