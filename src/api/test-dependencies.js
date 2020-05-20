const axios = require('axios')
const Graph = require('dagre').graphlib.Graph

const noop = () => {}

const getDependencies = async (packageName, onProgressUpdate = noop) => {
    // Used to store dependencies so duplicate requests aren't made
    const cache = {}
    const result = new Set()
    const remaining = []
    const root = new Graph({ directed: true })
    let hasFinished = false

    root.setNode(packageName)

    const _getDependencies = async name => {
        if (cache[name]) {
            return
        }

        const dependencies = await getPackageDependencies(name)

        cache[name] = dependencies

        dependencies.forEach(async dep => {
            result.add(dep)
            remaining.push(dep)
            root.setEdge(name, dep)
        })

        for (let i = 0; i < dependencies.length; i++) {
            await _getDependencies(dependencies[i])
            remaining.pop()
        }

        // Small hack to ensure that onProgressUpdate doesn't get
        // called multiple time with a value of 0
        if (!hasFinished) {
            onProgressUpdate(name, remaining.length)
        }

        hasFinished = remaining.length === 0
    }

    await _getDependencies(packageName)

    return root
}

// Gets the dependencies for a single package
const getPackageDependencies = packageName => {
    return new Promise((resolve, reject) => {
        axios
            .get(`https://registry.npmjs.cf/${packageName}`)
            .then(res => res.data)
            .then(res => {
                const latestVersion = res['dist-tags'].latest
                const versionInfo = res.versions[latestVersion]
                const dependencies = Object.keys(versionInfo.dependencies || [])

                resolve(dependencies)
            })
            .catch(err => {
                reject(err.message)
            })
    })
}

/**
 * Turns a dagre graph object into JSON that can be parsed by vis. The JSON looks like this:
 *
 * ```
 * {
 *      "rootNode": "cookies",
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
```
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

const onProgressUpdate = (name, remaining) => {
    // console.log(`Loading dependencies for ${name} remaining: ${remaining}`)
}

const packageName = 'express'

getDependencies(packageName)
    .then(graph => graphToJson(packageName, graph))
    .then(json => {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(json))
    })
    // eslint-disable-next-line no-console
    .catch(err => console.log(err))
