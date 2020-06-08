import store from '../store'
import { updateCacheSize } from '../store/actions/search'

// The amount of time before data in localStorage
// gets cleared (in milliseconds)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

class Cache {
    static init() {
        // Not using localStorage here since suggestions
        // aren't persisted across reloads
        this._suggestions = {}

        const lastAccessed = parseInt(localStorage.getItem('lastAccessed'))

        // Check to see if it's been more than 24 hours since
        // local storage was last read from
        if (Date.now() - lastAccessed > CACHE_EXPIRATION_TIME) {
            Cache.clear()
        }

        const entries = Cache.getEntries()
        const size = Cache.getSize()

        store.dispatch(updateCacheSize(entries, size))
    }

    static cacheDependencies(packageName, dependencies) {
        const data = {
            dependencies,
            storedAt: Date.now()
        }

        try {
            localStorage.setItem('lastAccessed', Date.now())
            localStorage.setItem(packageName, JSON.stringify(data))
        } catch (err) {
            Cache.clearHalf()
        }
    }

    static cacheSuggestions(packageName, suggestions) {
        this._suggestions[packageName] = suggestions
    }

    static getDependencies(packageName) {
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

    static getSuggestions(packageName) {
        return this._suggestions[packageName]
    }

    /**
     * Returns the size of localStorage in kilobytes
     */
    static getSize() {
        let total = 0

        for (const item in localStorage) {
            if (!localStorage.hasOwnProperty(item)) {
                continue
            }

            total += (localStorage[item].length + item.length) * 2
        }

        return total / 1024
    }

    /**
     * Returns the number of items in localStorage
     */
    static getEntries() {
        return localStorage.length
    }

    static clear() {
        localStorage.clear()
        store.dispatch(updateCacheSize(0, 0))
    }

    /**
     * Removes the oldest half of the cache. Useful for when the cache gets
     * full but we don't want to completely empty it
     */
    static clearHalf() {
        const cache = []

        for (const key in localStorage) {
            let item = localStorage.getItem(key)

            if (item && item.includes('dependencies')) {
                try {
                    item = JSON.parse(item)
                    cache.push({
                        key,
                        storedAt: item.storedAt
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

export default Cache
