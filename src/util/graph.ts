import { graphlib, Edge } from 'dagre'

/**
 * Turns a dagre graph object into a js object that can be parsed by vis.
 */
const graphToJson = (packageName: string, graph: Graph): GraphJson => {
    const nodes = graph.nodes().map((nodeName: string) => ({
        id: nodeName,
        label: nodeName
    }))

    const edges = graph.edges().map((edge: Edge) => ({
        from: edge.v,
        to: edge.w
    }))

    return {
        rootNodeId: packageName,
        nodes,
        edges
    }
}

type Graph = graphlib.Graph

type GraphNode = {
    id: string
    label: string
}

type GraphEdge = {
    from: string
    to: string
}

export type GraphJson = {
    rootNodeId: string
    nodes: GraphNode[]
    edges: GraphEdge[]
}

export { graphToJson }
