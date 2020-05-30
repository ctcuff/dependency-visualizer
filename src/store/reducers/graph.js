import { UPDATE_GRAPH_DATA } from '../actions/types'

const initialState = {
    rootNodeId: '',
    nodes: [],
    edges: []
}

const graphReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_GRAPH_DATA:
            return {
                ...action.data
            }
        default:
            return state
    }
}

export default graphReducer
