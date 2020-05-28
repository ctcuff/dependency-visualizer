import './dependency-graph.scss'
import React from 'react'
import watch from 'redux-watch'
import store from '../../store'
import { connect } from 'react-redux'
import deepEqual from 'deep-equal'
import { DataSet, Network } from 'vis-network/standalone'
import { Empty, Typography, Button, Tooltip } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { optimizedOptions, defaultOptions } from './config'
import image from '../../static/empty.png'

const { Title } = Typography

// The maximum number of nodes that can be rendered
// before performance optimizations occur
const MAX_NODE_LIMIT = 250

class DependencyGraph extends React.Component {
    constructor(props) {
        super(props)

        this.containerRef = React.createRef()
        this.centerButtonRef = React.createRef()

        this.network = null
        this.dataset = {
            nodes: new DataSet([]),
            edges: new DataSet([])
        }

        this.state = {
            graphLoadProgress: 0,
            nodesLoaded: 0,
            nodesRemaining: 0,
            isHighlightActive: false,
            graphPosition: null,
            graphScale: null
        }

        this.onStabilizationProgress = this.onStabilizationProgress.bind(this)
        this.onStabilizationIterationsDone = this.onStabilizationIterationsDone.bind(this)
        this.renderEmpty = this.renderEmpty.bind(this)
        this.highlightChildren = this.highlightChildren.bind(this)
        this.recenterGraph = this.recenterGraph.bind(this)

        const watcher = watch(store.getState, 'graph.data', deepEqual)

        // Watch a part of the store for changes in data
        // so we can reload the graph
        this.unsubscribe = store.subscribe(
            watcher(newValue => {
                this.updateGraph(newValue)
            })
        )
    }

    componentWillUnmount() {
        this.unsubscribe()
        if (this.network) {
            this.network.destroy()
        }
    }

    componentDidMount() {
        const container = this.containerRef.current

        this.network = new Network(container, this.dataset, defaultOptions)

        // Triggered when the graph starts trying to render nodes
        this.network.on('stabilizationProgress', this.onStabilizationProgress)

        // Triggered when the graph finishes rendering
        this.network.on('stabilizationIterationsDone', this.onStabilizationIterationsDone)

        this.network.on('hold', this.toggleCenterButton.bind(this, false))
        this.network.on('dragStart', this.toggleCenterButton.bind(this, false))

        this.network.on('release', this.toggleCenterButton.bind(this, true))
        this.network.on('dragEnd', this.toggleCenterButton.bind(this, true))

        this.network.on('click', this.highlightChildren)
    }

    updateGraph(data) {
        if (!this.network) {
            return
        }

        this.dataset.nodes.clear()
        this.dataset.edges.clear()

        this.dataset.nodes.update(this.props.nodes)
        this.dataset.edges.update(this.props.edges)

        if (this.dataset.nodes.length >= MAX_NODE_LIMIT) {
            this.network.setOptions({ ...optimizedOptions })
        }

        this.network.setData(this.dataset)
        this.network.redraw()

        this.dataset.nodes.update({
            id: data.rootNodeId,
            size: 32
        })
    }

    onStabilizationProgress({ iterations, total }) {
        this.setState({ graphLoadProgress: Math.round((iterations / total) * 100) })
    }

    onStabilizationIterationsDone() {
        this.setState({
            graphLoadProgress: 100,
            graphPosition: this.network.getViewPosition(),
            graphScale: this.network.getScale()
        })

        // Disabling physics after the graph renders lets us
        // keep the graphs layout, but prevents nodes from
        // moving when other nodes are dragged
        this.network.setOptions({ physics: false })
    }

    recenterGraph() {
        if (!this.state.graphPosition || !this.state.graphScale) {
            return
        }

        this.network.moveTo({
            position: this.state.graphPosition,
            scale: this.state.graphScale
        })
    }

    toggleCenterButton(show) {
        if (!this.centerButtonRef || !this.centerButtonRef.current) {
            return
        }

        this.centerButtonRef.current.style.display = show ? '' : 'none'
    }

    highlightChildren(params) {
        const nodes = this.dataset.nodes.get({ returnType: 'Object' })
        const edges = this.dataset.edges.get({ returnType: 'Object' })
        const defaultColor = '#86b3fb'
        const selectedNodeColor = '#1c51a0'
        const inactiveColor = 'rgba(150, 150, 150, 0.25)'
        const activeNodeSize = 32
        const inactiveNodeSize = 12

        // length will be > 0 if a node was selected
        if (params.nodes.length > 0) {
            this.setState({ isHighlightActive: true })

            const selectedNode = params.nodes[0]

            // Make any node that isn't the currently selected node or a child
            // of the currently selected node grey
            for (const id in nodes) {
                nodes[id].color = inactiveColor
                nodes[id].size = inactiveNodeSize

                if (nodes[id].hiddenLabel === undefined) {
                    nodes[id].hiddenLabel = nodes[id].label
                    nodes[id].label = undefined
                }
            }

            for (const id in edges) {
                edges[id].hidden = false
            }

            // Get all nodes going from the selected node to its children
            const connectedNodes = this.network.getConnectedNodes(selectedNode, 'to')

            // Give color/label back to the children of the selected node
            for (let i = 0; i < connectedNodes.length; i++) {
                nodes[connectedNodes[i]].color = selectedNodeColor
                if (nodes[connectedNodes[i]].hiddenLabel !== undefined) {
                    nodes[connectedNodes[i]].label = nodes[connectedNodes[i]].hiddenLabel
                    nodes[connectedNodes[i]].hiddenLabel = undefined
                }
            }

            // Show edges that go from the selected node to its children
            for (const id in edges) {
                if (
                    edges[id].from === selectedNode &&
                    connectedNodes.includes(edges[id].to)
                ) {
                    continue
                }
                edges[id].hidden = true
            }

            // Give color/label back to the selected node
            nodes[selectedNode].color = defaultColor
            nodes[selectedNode].size = activeNodeSize

            if (nodes[selectedNode].hiddenLabel !== undefined) {
                nodes[selectedNode].label = nodes[selectedNode].hiddenLabel
                nodes[selectedNode].hiddenLabel = undefined
            }
        } else if (this.state.isHighlightActive) {
            // Reset the color and label of all
            // nodes/edges when the graph is clicked
            for (const id in nodes) {
                nodes[id].color = defaultColor

                // Make sure the root node of the graph gets back
                // its larger size
                nodes[id].size =
                    id === this.props.rootNodeId ? activeNodeSize : inactiveNodeSize

                if (nodes[id].hiddenLabel !== undefined) {
                    nodes[id].label = nodes[id].hiddenLabel
                    nodes[id].hiddenLabel = undefined
                }
            }

            for (const id in edges) {
                edges[id].hidden = false
            }
            this.setState({ isHighlightActive: false })
        }

        const updatedNodes = []
        const updatedEdges = []

        for (const id in nodes) {
            if (nodes.hasOwnProperty(id)) {
                updatedNodes.push(nodes[id])
            }
        }

        for (const id in edges) {
            if (edges.hasOwnProperty(id)) {
                updatedEdges.push(edges[id])
            }
        }

        this.dataset.nodes.update(updatedNodes)
        this.dataset.edges.update(updatedEdges)
        this.network.redraw()
    }

    renderEmpty() {
        if (this.props.nodes.length > 0) {
            return null
        }

        return (
            <div className="no-data">
                <Empty image={image} imageStyle={{ height: '12em' }} description={null}>
                    <div>
                        <Title level={2}>No data to show</Title>
                        <p>{`It's lookin pretty empty in here.`}</p>
                        <p className="message">
                            {`Try searching for a package like "react" or "express".
                            Although, that might be hard if you don't have hands. Or maybe
                            you're a robot. Thats ok, I wont judge.`}
                        </p>
                    </div>
                </Empty>
            </div>
        )
    }

    render() {
        const { graphLoadProgress, graphPosition, graphScale } = this.state

        // Set the network wrapper to hidden so that vis can
        // still find the graph element even when there's
        // no data to show
        return (
            <div className="dependency-graph">
                {graphLoadProgress < 100 || !graphPosition || !graphScale ? null : (
                    <Tooltip placement="topRight" title="Recenter graph">
                        <Button
                            icon={<SyncOutlined />}
                            size="large"
                            className="recenter-btn"
                            onClick={this.recenterGraph}
                            ref={this.centerButtonRef}
                        />
                    </Tooltip>
                )}
                <div className="network-wrapper" hidden={this.props.nodes.length === 0}>
                    {graphLoadProgress === 100 ? null : (
                        <div className="progress-wrapper">
                            <div className="progress">{graphLoadProgress}%</div>
                            <div className="progress-title">Rendering nodes...</div>
                        </div>
                    )}
                    <div ref={this.containerRef} className="network" />
                </div>
                {this.renderEmpty()}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    nodes: state.graph.data.nodes,
    edges: state.graph.data.edges,
    rootNodeId: state.graph.data.rootNodeId
})

export default connect(mapStateToProps, null)(DependencyGraph)
