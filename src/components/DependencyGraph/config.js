// See: https://visjs.github.io/vis-network/docs/network/
// for detailed config info

const defaultOptions = {
    nodes: {
        shape: 'dot',
        size: 12
    },
    layout: {
        improvedLayout: false
    },
    edges: {
        smooth: {
            type: 'continuous'
        },
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
        maxVelocity: 50,
        solver: 'forceAtlas2Based',
        timestep: 0.5,
        forceAtlas2Based: {
            gravitationalConstant: -26,
            centralGravity: 0.005,
            springLength: 230,
            springConstant: 0.18,
            avoidOverlap: 1
        },
        stabilization: {
            enabled: true,
            iterations: 500,
            updateInterval: 1
        }
    },
    interaction: {
        hideEdgesOnDrag: true,
        hideEdgesOnZoom: true
    }
}

// Graph options that increase fps/rendering speeds
// for larger data sets
const optimizedOptions = {
    ...defaultOptions,
    nodes: {
        ...defaultOptions.nodes,
        scaling: {
            min: 10,
            max: 30
        }
    },
    edges: {
        ...defaultOptions.edges,
        width: 0.15
    },
    physics: {
        ...defaultOptions.physics,
        forceAtlas2Based: {
            ...defaultOptions.physics.forceAtlas2Based,
            avoidOverlap: 0
        },
        stabilization: {
            updateInterval: 1
        }
    }
}

export { defaultOptions, optimizedOptions }
