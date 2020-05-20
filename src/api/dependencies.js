import { graphlib } from 'dagre'
import { getDependenciesFromCache, cacheDependencies } from '../util/cache'

const Graph = graphlib.Graph
const noop = () => {}

const getDependencies = async (packageName, onProgressUpdate = noop) => {
    // Used to store dependencies so duplicate requests aren't made
    const seen = {}
    const result = new Set()
    const remaining = []
    const root = new Graph({ directed: true })

    root.setNode(packageName)

    const _getDependencies = async name => {
        // Don't load modules that have already been requested
        if (seen[name]) {
            return
        }

        const deps = getDependenciesFromCache(name)
        const promises = []
        const dependencies = deps || (await getPackageDependencies(name))

        seen[name] = true

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
                _getDependencies(dep).then(() => {
                    result.add(dep)
                    root.setEdge(name, dep)
                    remaining.pop()
                })
            )
        }

        onProgressUpdate(remaining.length, result.size, name)

        return Promise.all(promises)
    }

    await _getDependencies(packageName)

    // Send one final update to ensure results are accurate
    onProgressUpdate(remaining.length, result.size)

    return root
}

const getPackageDependencies = packageName => {
    return new Promise((resolve, reject) => {
        const dependencies = getDependenciesFromCache(packageName)

        if (dependencies) {
            resolve(dependencies)
            return
        }

        fetch(`https://registry.npmjs.cf/${packageName}`)
            .then(res => {
                if (res.status !== 200) {
                    return Promise.reject(res.status)
                }
                return res.json()
            })
            .then(res => {
                const latestVersion = res['dist-tags'].latest
                const versionInfo = res.versions[latestVersion]
                const dependencies = Object.keys(versionInfo.dependencies || [])

                resolve(dependencies)
            })
            .catch(err => reject(err))
    })
}

const getPackageInfo = packageName => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.npms.io/v2/package/${packageName}`)
            .then(res => {
                if (res.status !== 200) {
                    return Promise.reject(res.status)
                }
                return res.json()
            })
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
}

/**
 * Turns a dagre graph object into JSON that can be parsed by vis. The JSON looks like this:
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
        rootNode: packageName,
        nodes,
        edges
    }
}

const API = {
    getDependencies,
    getPackageInfo,
    graphToJson
}

export default API
