import { UPDATE_GRAPH_DATA } from './types'
import { GraphState } from '../reducers/graph'

type GraphUpdateData = {
    type: typeof UPDATE_GRAPH_DATA
    data: GraphState
}

const updateGraphData = (data: GraphState): GraphAction => ({
    type: UPDATE_GRAPH_DATA,
    data
})

export type GraphAction = GraphUpdateData
export { updateGraphData }
