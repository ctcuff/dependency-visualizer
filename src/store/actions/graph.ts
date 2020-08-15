import { UPDATE_GRAPH_DATA } from './types'
import { GraphState } from '../reducers/graph'

const updateGraphData = (data: GraphState): GraphAction => ({
    type: UPDATE_GRAPH_DATA,
    data
})

type GraphUpdateData = {
    type: typeof UPDATE_GRAPH_DATA
    data: GraphState
}

export type GraphAction = GraphUpdateData
export { updateGraphData }
