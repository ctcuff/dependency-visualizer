import { updateCacheSize } from '../store/actions/search'
import localforage from 'localforage'
import store from '../store'

// The amount of time before data in localStorage
// gets cleared (in milliseconds)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

/**
 * A wrapper around localforage. localforage uses
 * indexedDB which means we can read from it without
 * blocking the DOM like localStorage does.
 */
class Cache {
    static async init() {
        const lastAccessed = await localforage.getItem('lastAccessed')

        // Check to see if its been more than 24 hours since
        // local storage was last read from
        if (lastAccessed && Date.now() - lastAccessed > CACHE_EXPIRATION_TIME) {
            Cache.clear()
        }

        const entries = await Cache.entries()
        const size = await Cache.size()

        store.dispatch(updateCacheSize(entries, size))

        // Not using localforage here since suggestions
        // to be don't need persisted across reloads
        this._suggestions = {}
    }

    static cacheDependencies(packageName, dependencies) {
        try {
            // Errors here might happen if we try to store an
            // item but the cache is already full
            localforage.setItem('lastAccessed', Date.now())
            localforage.setItem(packageName, dependencies)
        } catch (e) {
            Cache.clear()
        }
    }

    static async getDependencies(packageName) {
        try {
            const dependencies = await localforage.getItem(packageName)
            return dependencies
        } catch (e) {
            return null
        }
    }

    static async clear() {
        try {
            await localforage.clear()
            store.dispatch(updateCacheSize(0, 0))
        } catch (e) {}
    }

    /**
     * Returns the number of items in the cache
     */
    static async entries() {
        try {
            const entries = await localforage.length()
            return entries
        } catch (e) {
            return 0
        }
    }

    /**
     * Return the size of the cache in KB
     */
    static async size() {
        let total = 0

        try {
            await localforage.iterate((value, key) => {
                // A character in JS takes up 2 bytes
                total += key.length * 2
                if (Array.isArray(value)) {
                    value.forEach(val => (total += val.length * 2))
                }
            })
        } catch (e) {}

        return total / 1024
    }

    static cacheSuggestions(packageName, suggestions) {
        this._suggestions[packageName] = suggestions
    }

    static getSuggestions(packageName) {
        return this._suggestions[packageName]
    }
}

Cache.init()

window._Cache = Cache

export default Cache
