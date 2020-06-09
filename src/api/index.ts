import { graphlib } from 'dagre'
import Cache from '../util/cache'
import { Suggestion } from '../util/cache'

const Graph = graphlib.Graph

/**
 * Searches for every dependency a package relies on,
 * but only if that package is found on npm's registry api.
 */
const getDependencies = async (
    packageName: string,
    onProgressUpdate: OnProgressUpdate
): Promise<Graph> => {
    // Since _getPackageDependencies doesn't fail when it receives
    // a 404, we need to check if the package actually exists first
    const exists = await doesPackageExist(packageName)

    if (!exists) {
        throw new Error('Not found')
    }

    const root = new Graph({ directed: true })

    root.setNode(packageName, '')

    await _getDependencies(packageName, root, onProgressUpdate)

    return root
}

/**
 * Searches for every dependency from a package.json file.
 * Note that this function doesn't care about 404 errors it might get
 * from searching the npm registry.
 */
const getDependenciesFromFile = async (
    packageName: string,
    dependencies: string[],
    onProgressUpdate: OnProgressUpdate
): Promise<Graph> => {
    const root = new Graph({ directed: true })
    const result = new Set<string>()
    const promises: Promise<void | void[]>[] = []

    root.setNode(packageName, '')

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
    remaining: Array<string> = []
): Promise<void | void[]> => {
    if (seen[name]) {
        return
    }

    seen[name] = true

    let dependencies = Cache.getDependencies(name)

    if (dependencies === null) {
        const res = await getPackageDependencies(name)
        if (res.status !== 200) {
            return
        }
        dependencies = res.dependencies
    }

    const promises: Promise<void>[] = []

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

const getPackageDependencies = (packageName: string): Promise<DependencyResponse> => {
    return new Promise((resolve, reject) => {
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
                const data: RegistryResponse = await res.json()

                // This usually happens if a package is internal or unpublished.
                // These usually don't have any dependencies listed
                if (!data['dist-tags'] || !data.versions) {
                    resolve({
                        dependencies: [] as string[],
                        status: 200
                    })
                    return
                }

                const latestVersion = data['dist-tags'].latest
                const versionInfo = data.versions[latestVersion]

                resolve({
                    dependencies: Object.keys(versionInfo.dependencies || []),
                    status: 200
                })
            })
            .catch(err => reject(err))
    })
}

const getSuggestions = (query: string): Promise<Suggestion[]> => {
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

type DependencyResponse = {
    dependencies: string[]
    status: number
}

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