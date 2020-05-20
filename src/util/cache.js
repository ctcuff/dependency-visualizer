import store from '../store'
import { updateCacheSize } from '../store/actions/search'

const cacheDependencies = (packageName, dependencies) => {
    const data = {
        dependencies,
        storedAt: Date.now()
    }

    localStorage.setItem('lastAccessed', Date.now())
    localStorage.setItem(packageName, JSON.stringify(data))
}

const getDependenciesFromCache = packageName => {
    const cache = localStorage.getItem(packageName)

    if (cache) {
        const dependencies = JSON.parse(cache).dependencies
        return Array.from(dependencies)
    }

    return null
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
    store.dispatch(updateCacheSize(0))

    return length
}

export { cacheDependencies, getDependenciesFromCache, getCacheSize, clearCache }
