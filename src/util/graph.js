/**
 * Turns a dagre graph object into a js object that can be parsed by vis.
 * The js object looks like this:
 *
 * ```
 * {
 *       "rootNodeId": "cookies",
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
    const nodes = graph.nodes().map(nodeName => ({
        id: nodeName,
        label: nodeName
    }))

    const edges = graph.edges().map(edge => ({
        from: edge.v,
        to: edge.w
    }))

    return {
        rootNodeId: packageName,
        nodes,
        edges
    }
}

export { graphToJson }
