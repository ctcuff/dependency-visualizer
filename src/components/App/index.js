import './app.scss'
import React from 'react'
import DependencyGraph from '../DependencyGraph'
import LoadingOverlay from '../LoadingOverlay'
import { Layout } from 'antd'
import Menu from '../../components/Menu'
import { connect } from 'react-redux'
import ErrorOverlay from '../ErrorOverlay'
import Cache from '../../util/cache'

const { Content } = Layout

const App = props => (
    <Layout className="app">
        <Menu />
        <Layout className="content">
            <Content>
                {props.isLoading || props.errorCode ? null : <DependencyGraph />}
                <LoadingOverlay />
                <ErrorOverlay />
            </Content>
        </Layout>
    </Layout>
)

const mapStateToProps = state => ({
    isLoading: state.search.isLoading,
    errorCode: state.search.errorCode
})

Cache.init()

export default connect(mapStateToProps)(App)
