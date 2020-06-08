import { graphlib } from 'dagre'
import Cache from '../util/cache'

const Graph = graphlib.Graph
const noop = () => {}

/**
 * Searches for every dependency a package relies on,
 * but only if that package is found on npm's registry api.
 *
 * @param {String} packageName
 * @param {Function} onProgressUpdate
 */
const getDependencies = async (packageName, onProgressUpdate) => {
    // Since _getPackageDependencies doesn't fail when it receives
    // a 404, we need to check if the package actually exists first
    const exists = await doesPackageExist(packageName)

    if (!exists) {
        throw new Error('Not found')
    }

    const root = new Graph({ directed: true })

    root.setNode(packageName)

    await _getDependencies(packageName, root, onProgressUpdate)

    return root
}

/**
 * Searches for every dependency from a package.json file.
 * Note that this function doesn't care about 404 errors it might get
 * from searching the npm registry.
 *
 * @param {String} packageName
 * @param {String[]} dependencies
 * @param {Function} onProgressUpdate
 */
const getDependenciesFromFile = async (packageName, dependencies, onProgressUpdate) => {
    const root = new Graph({ directed: true })
    const result = new Set()
    const promises = []

    root.setNode(packageName)

    dependencies.forEach(dep => {
        root.setEdge(packageName, dep)
        promises.push(_getDependencies(dep, root, onProgressUpdate, result))
    })

    await Promise.all(promises)

    return root
}

/**
 * Recursively makes requests to the npm registry api to get all dependencies
 * of a package. Requests are added to a promise stack then are removed when
 * the request completes. Once the stack is empty and all requests have
 * completed, the function returns
 *
 * @param {String} name - The name of the package to search
 * @param {graphlib.Graph} root - Used to build a graph of dependencies
 * @param {Function} onProgressUpdate - Called when a request completes
 * @param {Set} result - Used to keep track of what dependencies this package has
 * @param {Object} seen - Used to make sure duplicate requests aren't made
 * @param {Array} remaining - Used to keep track of what requests still need to be made
 */
const _getDependencies = async (
    name,
    root,
    onProgressUpdate = noop,
    result = new Set(),
    seen = {},
    remaining = []
) => {
    // Don't load modules that have already been requested
    if (seen[name]) {
        return
    }

    seen[name] = true

    let dependencies = Cache.getDependencies(name)

    if (!dependencies) {
        const res = await getPackageDependencies(name)
        if (res.status !== 200) {
            return
        }
        dependencies = res.dependencies
    }

    const promises = []

    // Cache this module's dependencies
    // so we can look it up faster
    Cache.cacheDependencies(name, dependencies)

    dependencies.forEach(dep => {
        remaining.push(dep)

        // Add each dependency call to a promise stack so we
        // can make multiple requests instead of waiting
        // for each individual request to complete
        promises.push(
            _getDependencies(dep, root, onProgressUpdate, result, seen, remaining).then(
                () => {
                    result.add(dep)
                    root.setEdge(name, dep)
                    remaining.pop()

                    onProgressUpdate(remaining.length, result.size, name)
                }
            )
        )
    })

    return Promise.all(promises)
}

const doesPackageExist = packageName => {
    return new Promise(resolve => {
        fetch(`https://registry.npmjs.cf/${encodeURIComponent(packageName)}`)
            .then(res => resolve(res.status === 200))
            .catch(() => resolve(false))
    })
}

const getPackageDependencies = packageName => {
    return new Promise(async (resolve, reject) => {
        fetch(`https://registry.npmjs.cf/${encodeURIComponent(packageName)}`)
            .then(async res => {
                // Resolve the error status instead of rejecting so we can
                // keep recursively searching for packages in other functions
                // without making Promise.all fail
                if (res.status !== 200) {
                    resolve({
                        dependencies: [],
                        status: res.status
                    })
                    return
                }
                res = await res.json()

                // This usually happens if a package is internal or unpublished.
                // These usually don't have any dependencies listed
                if (!res['dist-tags'] || !res.versions) {
                    resolve({
                        dependencies: [],
                        status: 200
                    })
                    return
                }

                const latestVersion = res['dist-tags'].latest
                const versionInfo = res.versions[latestVersion]

                resolve({
                    dependencies: Object.keys(versionInfo.dependencies || []),
                    status: 200
                })
            })
            .catch(err => reject(err))
    })
}

const getSuggestions = query => {
    const url = `https://registry.npmjs.org/-/v1/search?size=10&from=0&text="${encodeURIComponent(
        query
    )}"`
    const cached = Cache.getSuggestions(query)

    return new Promise((resolve, reject) => {
        if (cached) {
            resolve(cached)
            return
        }

        fetch(url)
            .then(res => res.json())
            .then(res => {
                const suggestions = res.objects.map(obj => ({
                    name: obj.package.name,
                    description: obj.package.description
                }))
                resolve(suggestions)

                Cache.cacheSuggestions(query, suggestions)
            })
            .catch(err => reject(err))
    })
}

const API = {
    getDependencies,
    getDependenciesFromFile,
    getSuggestions
}

export default API
