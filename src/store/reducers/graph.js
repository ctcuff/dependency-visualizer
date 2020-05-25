import { UPDATE_GRAPH_DATA, RENDER_START, RENDER_FINISHED } from '../actions/types'
import { defaultOptions } from '../../components/DependencyGraph/config'

const defaultData = {
    rootNodeId: '',
    nodes: [],
    edges: []
}

const initialState = {
    isRendering: false,
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
        case RENDER_START:
            return {
                ...state,
                isRendering: true
            }
        case RENDER_FINISHED:
            return {
                ...state,
                isRendering: false
            }
        default:
            return state
    }
}

export default graphReducer
