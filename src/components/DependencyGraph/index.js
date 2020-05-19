import './dependency-graph.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import watch from 'redux-watch'
import store from '../../store'
import { connect } from 'react-redux'
import deepEqual from 'deep-equal'
import { DataSet, Network } from 'vis-network/standalone'
import { Progress, Empty, Typography } from 'antd'
import image from '../../static/empty.png'


const { Title } = Typography

class DependencyGraph extends React.Component {
    constructor(props) {
        super(props)
        this.containerRef = React.createRef()

        this.state = {
            // Set progress to NaN so the progress bar
            // doesn't show when an error occurs during loading
            graphLoadProgress: 0,
            nodesLoaded: 0,
            nodesRemaining: 0
        }

        this.onStabilizationProgress = this.onStabilizationProgress.bind(this)
        this.onStabilizationIterationsDone = this.onStabilizationIterationsDone.bind(this)
        this.renderEmpty = this.renderEmpty.bind(this)

        const watcher = watch(store.getState, 'graph.data', deepEqual)

        // Watch a part of the store for changes in data
        // so we can reload the graph
        this.unsubscribe = store.subscribe(watcher(newValue => {
            this.updateGraph(newValue)
        }))
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    componentDidMount() {
        this.setState({ graphLoadProgress: 0 })

        const container = ReactDOM.findDOMNode(this.containerRef)
        const dataset = {
            nodes: new DataSet(this.props.nodes),
            edges: new DataSet(this.props.edges)
        }

        dataset.nodes.update({
            id: this.props.rootNode,
            size: 32,
            color: '#1c51a0'
        })

        this.network = new Network(container, dataset, this.props.options)
        this.network.on('stabilizationProgress', this.onStabilizationProgress)
        this.network.on('stabilizationIterationsDone', this.onStabilizationIterationsDone)
    }

    updateGraph(data) {
        if (!this.network) {
            return
        }

        const dataset = {
            nodes: new DataSet(data.nodes),
            edges: new DataSet(data.edges)
        }

        this.network.setData(dataset)
        this.network.redraw()

        if (data.nodes.length > 450) {
            this.network.setOptions({
                ...this.props.options,
                physics: {
                    enabled: false
                }
            })
        }

        dataset.nodes.update({
            id: data.rootNode,
            size: 32,
            color: '#1c51a0'
        })
    }

    onStabilizationProgress({ iterations, total }) {
        this.setState({ graphLoadProgress: Math.round((iterations / total) * 100) })
    }

    onStabilizationIterationsDone() {
       this.setState({ graphLoadProgress: 100 })
    }

    renderEmpty() {
        if (this.props.nodes.length > 0) {
            return null
        }

        return (
            <div className="no-data">
                <Empty
                    image={image}
                    imageStyle={{ height: '12em' }}
                    description={null}
                >
                    <div>
                        <Title level={2}>No data to show</Title>
                        <p>
                        It's lookin' pretty empty in here.
                        </p>
                        <p>
                            Try searching for a package like "react" or "express". Although,
                            <br />
                            that might be hard of you don't have hands. Or
                            maybe you're a robot.
                            <br />
                            That's ok, I won't judge.
                        </p>
                    </div>
                </Empty>
            </div>
        )
    }

    render() {
        const progress = this.state.graphLoadProgress

        // Set the dependency graph to hidden so that vis can
        // still find the graph element when there is no data
        // to show
        return (
            <div className="dependency-graph">
                <div className="network-wrapper" hidden={this.props.nodes.length === 0}>
                    {(progress === 100 || isNaN(progress)) ? null : (
                        <div className="loading-progress">
                            <Progress percent={progress} type="circle" />
                            <div className="progress-title">Rendering nodes...</div>
                        </div>
                    )}
                    <div ref={ref => (this.containerRef = ref)} className="network" />
                </div>
                {this.renderEmpty()}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    options: state.graph.options,
    nodes: state.graph.data.nodes,
    edges: state.graph.data.edges,
    rootNode: state.graph.data.rootNode,
})

export default connect(mapStateToProps)(DependencyGraph)
