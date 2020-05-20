import './error-overlay.scss'
import React from 'react'
import { connect } from 'react-redux'
import image from '../../static/404.png'
import { Empty, Typography } from 'antd'

const { Title } = Typography

const ErrorOverlay = props => {
    if (!props.errorCode) {
        return null
    }

    return (
        <div className="error-overlay">
            <Empty image={image} imageStyle={{ height: '22em' }} description={null}>
                <div>
                    <Title level={2}>Module not found</Title>
                    <p>
                        We searched through time and space but couldn't find the module
                        you're looking for.
                    </p>
                    <p>
                        Check your spelling and try again. Not trying to make you feel bad
                        or anything, but hey,
                        <br />
                        we all make mistakes. I can't tell you how many times I've
                        misspelled Wednesday.
                        <br />
                        Am I the only person who has to sound it out?
                    </p>
                </div>
            </Empty>
        </div>
    )
}

const mapStateToProps = state => ({
    errorCode: state.search.errorCode
})

export default connect(mapStateToProps)(ErrorOverlay)
