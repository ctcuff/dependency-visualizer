import { graphlib } from 'dagre'
import Cache, { Suggestion } from '../util/cache'
import { GraphJson, graphToJson } from '../util/graph'

const Graph = graphlib.Graph

/**
 * Searches for every dependency a package relies on,
 * but only if that package is found on npm's registry api.
 */
const getDependencies = async (
    packageName: string,
    onProgressUpdate: OnProgressUpdate
): Promise<GraphJson> => {
    // Since _getPackageDependencies doesn't fail when it receives
    // a 404, we need to check if the package actually exists first
    // so we can show the 404 error page
    const exists = await doesPackageExist(packageName)

    if (!exists) {
        throw new Error('Not found')
    }

    const root = new Graph({ directed: true })

    root.setNode(packageName, '')

    await _getDependencies(packageName, root, onProgressUpdate)

    return graphToJson(packageName, root)
}

/**
 * Searches for every dependency from a package.json file.
 * This function doesn't care about 404 errors it might get
 * from searching the npm registry since some packages listed in
 * a package.json file might not be hosted on npm servers.
 */
const getDependenciesFromFile = async (
    packageName: string,
    dependencies: string[],
    onProgressUpdate: OnProgressUpdate
): Promise<GraphJson> => {
    const root = new Graph({ directed: true })
    const result = new Set<string>()
    const promises: Promise<void | void[]>[] = []

    root.setNode(packageName, '')

    dependencies.forEach(dep => {
        root.setEdge(packageName, dep)
        promises.push(_getDependencies(dep, root, onProgressUpdate, result))
    })

    await Promise.all(promises)

    return graphToJson(packageName, root)
}

/**
 * Recursively makes requests to the npm registry api to get all dependencies
 * of a package. Requests are added to a promise stack then are removed when
 * the request completes. Once the stack is empty and all requests have
 * completed, the function returns
 *
 * @param {String} name - The name of the package to search
 * @param {Graph} root - Used to build a graph of dependencies
 * @param {OnProgressUpdate} onProgressUpdate - Called when a request completes
 * @param {Set} result - Used to keep track of what dependencies this package has
 * @param {Object} seen - Used to make sure duplicate requests aren't made
 * @param {Array} remaining - Used to keep track of what requests still need to be made
 */
const _getDependencies = async (
    name: string,
    root: Graph,
    onProgressUpdate: OnProgressUpdate,
    result: Set<string> = new Set(),
    seen: { [key: string]: boolean } = {},
    remaining: string[] = []
): Promise<void | void[]> => {
    if (seen[name]) {
        return
    }

    seen[name] = true

    const promises: Promise<void>[] = []
    const dependencies =
        Cache.getDependencies(name) || (await getPackageDependencies(name))

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

const doesPackageExist = (packageName: string): Promise<boolean> => {
    return new Promise(resolve => {
        fetch(`https://registry.npmjs.cf/${encodeURIComponent(packageName)}`)
            .then(res => resolve(res.status === 200))
            .catch(() => resolve(false))
    })
}

const getPackageDependencies = (packageName: string): Promise<string[]> => {
    return new Promise(resolve => {
        fetch(`https://registry.npmjs.cf/${encodeURIComponent(packageName)}`)
            .then(res => res.json())
            .then((res: RegistryResponse) => {
                // This happens if a package doesn't exist, is internal,
                // or is unpublished. Instead of failing, an empty array
                // is resolved so we don't fail any Promise.all calls.
                if (!res['dist-tags'] || !res.versions) {
                    resolve([])
                    return
                }

                const latestVersion = res['dist-tags'].latest
                const versionInfo = res.versions[latestVersion]

                resolve(Object.keys(versionInfo.dependencies || []))
            })
    })
}

const getSuggestions = (query: string): Promise<Suggestion[]> => {
    if (!query) {
        return Promise.resolve([])
    }

    const cached = Cache.getSuggestions(query)
    const url = `https://registry.npmjs.org/-/v1/search?size=10&from=0&text="${encodeURIComponent(
        query
    )}"`

    return new Promise((resolve, reject) => {
        if (cached) {
            resolve(cached)
            return
        }

        fetch(url)
            .then(res => res.json())
            .then((res: RegistryResponse) => {
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

type Graph = graphlib.Graph

type OnProgressUpdate = (remaining: number, result: number, name: string) => void

type RegistryPackageResponse = {
    'dist-tags'?: {
        [key: string]: string
    }
    versions?: {
        [key: string]: {
            dependencies: {
                [key: string]: string
            }
        }
    }
}

type RegistrySuggestionResponse = {
    objects: {
        package: {
            name: string
            description: string
        }
    }[]
}

type RegistryResponse = RegistryPackageResponse & RegistrySuggestionResponse

export default API
