import './app.scss'
import React from 'react'
import DependencyGraph from '../DependencyGraph'
import LoadingOverlay from '../LoadingOverlay'
import { Layout } from 'antd'
import Menu from '../../components/Menu'
import { connect } from 'react-redux'
import ErrorOverlay from '../ErrorOverlay'
import Cache from '../../util/cache'
import debounce from 'util/debounce'

const { Content } = Layout

class App extends React.Component {
    constructor(props) {
        super(props)

        this.updateViewport = debounce(this.updateViewport, 100)
    }
    componentDidMount() {
        this.updateViewport()
        window.addEventListener('resize', this.updateViewport)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateViewport)
    }

    updateViewport() {
        // Updates the --vh variable used in the height mixin
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    render() {
        return (
            <Layout className="app">
                <Menu />
                <Layout className="content">
                    <Content>
                        {this.props.isLoading || this.props.errorCode ? null : (
                            <DependencyGraph />
                        )}
                        <LoadingOverlay />
                        <ErrorOverlay />
                    </Content>
                </Layout>
            </Layout>
        )
    }
}

const mapStateToProps = state => ({
    isLoading: state.search.isLoading,
    errorCode: state.search.errorCode
})

Cache.init()

export default connect(mapStateToProps)(App)
