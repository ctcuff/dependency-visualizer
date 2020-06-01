import store from '../store'
import { updateCacheSize } from '../store/actions/search'

const cacheDependencies = (packageName, dependencies) => {
    const data = {
        dependencies,
        storedAt: Date.now()
    }

    try {
        localStorage.setItem('lastAccessed', Date.now())
        localStorage.setItem(packageName, JSON.stringify(data))
    } catch (err) {
        // Errors here might happen if we try to store an
        // item but localStorage is already full
        clearHalfCache()
        clearSuggestions()
        store.dispatch(updateCacheSize())
    }
}

const getDependenciesFromCache = packageName => {
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

/**
 * Returns the size of localStorage in kilobytes
 */
const getCacheSize = () => {
    let total = 0

    for (const item in localStorage) {
        if (!localStorage.hasOwnProperty(item)) {
            continue
        }

        total += (localStorage[item].length + item.length) * 2
    }

    return total / 1024
}

const clearCache = () => {
    const length = localStorage.length

    localStorage.clear()
    store.dispatch(updateCacheSize())

    return length
}

const cacheSuggestions = (query, suggestions) => {
    try {
        // Suggestions are prefixed with s: so they don't
        // clash with cached dependencies
        localStorage.setItem(`s:${query}`, JSON.stringify(suggestions))
        localStorage.setItem('lastAccessed', Date.now())
    } catch (e) {
        clearSuggestions()
    }
}

const getSuggestionsFromCache = query => {
    const suggestions = localStorage.getItem(`s:${query}`)

    if (!suggestions) {
        return null
    }

    try {
        return JSON.parse(suggestions)
    } catch (e) {
        return null
    }
}

const clearSuggestions = () => {
    const suggestions = []

    for (const key in localStorage) {
        if (key.startsWith('s:')) {
            suggestions.push(key)
        }
    }

    suggestions.forEach(key => localStorage.removeItem(key))
}

/**
 * Removes the oldest half of cached dependencies.
 * Useful for when the cache gets full but we don't
 * want to completely empty it
 */
const clearHalfCache = () => {
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

export {
    cacheDependencies,
    getDependenciesFromCache,
    getCacheSize,
    clearCache,
    cacheSuggestions,
    getSuggestionsFromCache,
    clearSuggestions
}
