import { UPDATE_GRAPH_DATA } from '../actions/types'
import { GraphAction } from '../actions/graph'

type GraphNode = {
    id: string
    label: string
}

type GraphEdge = {
    from: string
    to: string
}

const initialState: GraphState = {
    rootNodeId: '',
    nodes: [],
    edges: []
}

const graphReducer = (state = initialState, action: GraphAction): GraphState => {
    switch (action.type) {
        case UPDATE_GRAPH_DATA:
            return {
                ...action.data
            }
        default:
            return state
    }
}

export type GraphState = {
    rootNodeId: string
    nodes: GraphNode[]
    edges: GraphEdge[]
}

export default graphReducer
