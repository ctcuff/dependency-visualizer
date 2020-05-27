import { UPDATE_GRAPH_DATA, RENDER_START, RENDER_FINISHED } from './types'

const updateGraphData = data => ({
    type: UPDATE_GRAPH_DATA,
    data
})

const renderStart = () => ({
    type: RENDER_START
})

const renderFinished = () => ({
    type: RENDER_FINISHED
})

export { updateGraphData, renderStart, renderFinished }
