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
        clearHalfCache()
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
        console.err('Error parsing cache', err)
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

/**
 * Removes the oldest half of the cache. Useful for when the cache gets
 * full but we don't want to completely empty it
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
                console.err('Error retrieving dependency from cache', err)
            }
        }
    }

    cache.sort((a, b) => a.storedAt - b.storedAt)

    for (let i = 0; i < Math.ceil(cache.length / 2); i++) {
        localStorage.removeItem(cache[i].key)
    }
}

export { cacheDependencies, getDependenciesFromCache, getCacheSize, clearCache }
