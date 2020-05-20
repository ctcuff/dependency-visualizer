import { UPDATE_GRAPH_DATA } from '../actions/types'

const defaultOptions = {
    nodes: {
        shape: 'dot',
        size: 12,
        shapeProperties: {
            interpolation: false
        }
    },
    layout: {
        improvedLayout: false
    },
    edges: {
        arrows: {
            to: {
                enabled: true,
                scaleFactor: 0.5
            },
            from: {
                enabled: false
            }
        }
    },
    physics: {
        forceAtlas2Based: {
            gravitationalConstant: -26,
            centralGravity: 0.005,
            springLength: 230,
            springConstant: 0.18
        },
        maxVelocity: 50,
        solver: 'forceAtlas2Based',
        timestep: 0.5,
        stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 50
        }
    }
}

const defaultData = {
    rootNode: '',
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
