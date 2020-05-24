import { graphlib } from 'dagre'
import { getDependenciesFromCache, cacheDependencies } from '../util/cache'

const Graph = graphlib.Graph
const noop = () => {}

/**
 * Searches for every dependency a package relies on,
 * but only if that package is found on NPM's registry api.
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
 * Recursively searches for every dependency from a package.json file.
 * Note that this function doesn't care about 404 errors it might get
 * from searching the NPM registry.
 *
 * @param {String} packageName
 * @param {String[]} dependencies
 * @param {Function} onProgressUpdate
 */
const getDependenciesFromFile = async (
    packageName,
    dependencies,
    onProgressUpdate
) => {
    const root = new Graph({ directed: true })

    root.setNode(packageName)

    for (let i = 0; i < dependencies.length; i++) {
        root.setEdge(packageName, dependencies[i])
        await _getDependencies(dependencies[i], root, onProgressUpdate)
    }

    return root
}

const _getDependencies = async (
    name,
    root,
    onProgressUpdate = noop,
    seen = {},
    remaining = [],
    result = new Set()
) => {
    // Don't load modules that have already been requested
    if (seen[name]) {
        return
    }

    seen[name] = true

    let dependencies = getDependenciesFromCache(name)

    if (!dependencies) {
        const res = await getPackageDependencies(name)
        if (res.status !== 200) {
            return
        }
        dependencies = res.dependencies
    }

    const promises = []

    // Add this module's dependencies to localStorage
    // so we can look it up faster
    cacheDependencies(name, dependencies)

    for (let i = 0; i < dependencies.length; i++) {
        const dep = dependencies[i]
        remaining.push(dep)

        // Add each dependency call to a promise stack so we
        // can make multiple requests instead of waiting
        // for each individual request to complete
        promises.push(
            _getDependencies(dep, root, onProgressUpdate, seen, remaining, result).then(
                () => {
                    result.add(dep)
                    root.setEdge(name, dep)
                    remaining.pop()

                    onProgressUpdate(remaining.length, result.size, name)
                }
            )
        )
    }

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
    return new Promise((resolve, reject) => {
        const dependencies = getDependenciesFromCache(packageName)

        if (dependencies) {
            resolve(dependencies)
            return
        }

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

/**
 * Turns a dagre graph object into a js object that can be parsed by vis.
 * The js object looks like this:
 *
 * ```
 * {
 *      "packageName": "cookies",
 *       "nodes": [
 *          {
 *             "id": "cookies",
 *             "label": "cookies"
 *          },
 *          {
 *             "id": "depd",
 *             "label": "depd"
 *          },
 *          {
 *             "id": "keygrip",
 *             "label": "keygrip"
 *          },
 *          {
 *             "id": "tsscmp",
 *             "label": "tsscmp"
 *          }
 *       ],
 *       "edges": [
 *          {
 *             "from": "cookies",
 *             "to": "depd"
 *          },
 *          {
 *             "from": "cookies",
 *             "to": "keygrip"
 *          },
 *          {
 *             "from": "keygrip",
 *             "to": "tsscmp"
 *          }
 *       ]
 * }
 *```
 */
const graphToJson = (packageName, graph) => {
    const nodes = []
    const edges = []

    graph.nodes().forEach(nodeName => {
        nodes.push({
            id: nodeName,
            label: nodeName
        })
    })

    graph.edges().forEach(edge => {
        edges.push({
            from: edge.v,
            to: edge.w
        })
    })

    return {
        rootNodeId: packageName,
        nodes,
        edges
    }
}

const API = {
    getDependencies,
    getDependenciesFromFile,
    graphToJson
}

export default API
