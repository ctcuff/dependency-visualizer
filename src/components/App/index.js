import './App.scss'
import React, { useEffect } from 'react'
import DependencyGraph from '../DependencyGraph'
import LoadingOverlay from '../LoadingOverlay'
import { Layout } from 'antd'
import Menu from '../../components/Menu'
import { connect } from 'react-redux'
import ErrorOverlay from '../ErrorOverlay'
import { clearCache } from '../../util/cache'

const { Content } = Layout

// The amount of time before data in localStorage
// gets cleared (in milliseconds)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

const App = props => {
    useEffect(() => {
        const lastAccessed = localStorage.getItem('lastAccessed')
        if (lastAccessed) {
            if (Date.now() - lastAccessed >= CACHE_EXPIRATION_TIME) {
                clearCache()
            }
        }
    })

    return (
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
}

const mapStateToProps = state => ({
    isLoading: state.search.isLoading,
    errorCode: state.search.errorCode
})

export default connect(mapStateToProps)(App)
