import store from '../store'
import { updateCacheSize } from '../store/actions/search'

// The amount of time before data in localStorage
// gets cleared (in milliseconds)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

class Cache {
    // Not using localStorage for suggestions
    // since they aren't persisted across reloads
    private static suggestions: SuggestionCache = {}

    static init(): void {
        const lastAccessed = parseInt(localStorage.getItem('lastAccessed') as string)

        // Check to see if it's been more than 24 hours since
        // local storage was last read from
        if (Date.now() - lastAccessed > CACHE_EXPIRATION_TIME) {
            Cache.clear()
        }

        const entries = Cache.getEntries()
        const size = Cache.getSize()

        store.dispatch(updateCacheSize(entries, size))
    }

    static cacheDependencies(packageName: string, dependencies: string[]): void {
        const data = {
            dependencies,
            storedAt: Date.now()
        }

        try {
            localStorage.setItem('lastAccessed', '' + Date.now())
            localStorage.setItem(packageName, JSON.stringify(data))
        } catch (err) {
            Cache.clearHalf()
        }
    }

    static cacheSuggestions(packageName: string, suggestions: Suggestion[]): void {
        this.suggestions[packageName] = suggestions
    }

    static getDependencies(packageName: string): string[] | null {
        const cache = localStorage.getItem(packageName)

        if (!cache) {
            return null
        }

        try {
            const dependencies = JSON.parse(cache).dependencies
            return Array.from(dependencies)
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error parsing cache', err)
            return null
        }
    }

    static getSuggestions(packageName: string): Suggestion[] | null {
        return this.suggestions[packageName]
    }

    /**
     * Returns the size of localStorage in kilobytes
     */
    static getSize(): number {
        let total = 0

        for (const item in localStorage) {
            if (!Object.prototype.hasOwnProperty.call(localStorage, item)) {
                continue
            }

            total += (localStorage[item].length + item.length) * 2
        }

        return total / 1024
    }

    /**
     * Returns the number of items in localStorage
     */
    static getEntries(): number {
        return localStorage.length
    }

    static clear(): void {
        localStorage.clear()
        store.dispatch(updateCacheSize(0, 0))
    }

    /**
     * Removes the oldest half of the cache. Useful for when the cache gets
     * full but we don't want to completely empty it
     */
    static clearHalf(): void {
        const cache = []

        for (const key in localStorage) {
            const item = localStorage.getItem(key)

            if (item && item.includes('dependencies')) {
                try {
                    const parsedItem: Package = JSON.parse(item)

                    cache.push({
                        key,
                        storedAt: parsedItem.storedAt
                    })
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Error retrieving dependency from cache', err)
                }
            }
        }

        cache.sort((a, b) => a.storedAt - b.storedAt)

        for (let i = 0; i < Math.ceil(cache.length / 2); i++) {
            localStorage.removeItem(cache[i].key)
        }
    }
}

export type Suggestion = {
    name: string
    description: string
}

type Package = {
    storedAt: number
    dependencies: string[]
}

type SuggestionCache = {
    [key: string]: Suggestion[]
}

export default Cache
