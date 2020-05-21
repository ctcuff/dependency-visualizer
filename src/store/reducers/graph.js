import { UPDATE_GRAPH_DATA } from '../actions/types'
import { defaultOptions } from '../../components/DependencyGraph/config'

const defaultData = {
    rootNodeId: '',
    nodes: [],
    edges: []
}

const initialState = {
    options: { ...defaultOptions },
    data: { ...defaultData }
}

const graphReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_GRAPH_DATA:
            return {
                ...state,
                data: {
                    ...action.data
                }
            }
        default:
            return state
    }
}

export default graphReducer
