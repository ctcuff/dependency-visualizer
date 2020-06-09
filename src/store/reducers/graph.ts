import { UPDATE_GRAPH_DATA } from '../actions/types'
import { GraphAction } from '../actions/graph'
import { GraphJson } from '../../util/graph'

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

export type GraphState = GraphJson

export default graphReducer
