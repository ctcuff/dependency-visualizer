import './loading-overlay.scss'
import React from 'react'
import { Spin } from 'antd'
import { Typography } from 'antd'
import { connect } from 'react-redux'

const { Title } = Typography
const messages = [
    'searching for dependencies...',
    'crunching data, sit tight...',
    'doing nerd calculations...',
    'contacting npm servers...',
    'searching the interwebs...',
    'contemplating the meaning of life...'
]

const LoadingOverlay = props => {
    if (!props.isLoading || props.error) {
        return null
    }

    return (
        <div className="loading-overlay">
            <div className="loading-content-wrapper">
                <div className="loading-container">
                    <Title level={2} className="loading-text">
                        Loading
                    </Title>
                    <Spin size={'large'} className="spinner" />
                </div>
                <p>
                    {!props.currentPackageLoaded
                        ? messages[Math.floor(Math.random() * messages.length)]
                        : `loading dependencies for ${props.currentPackageLoaded}`}
                </p>
            </div>
        </div>
    )
}

const mapStateToProps = state => ({
    isLoading: state.search.isLoading,
    currentPackageLoaded: state.search.currentPackageLoaded
})

export default connect(mapStateToProps)(LoadingOverlay)
