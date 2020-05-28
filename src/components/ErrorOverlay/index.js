import './error-overlay.scss'
import React from 'react'
import { connect } from 'react-redux'
import error404 from '../../static/404.png'
import errorCone from '../../static/error-cone.png'
import errorTripped from '../../static/error-tripped.png'
import { Empty, Typography } from 'antd'
import Errors from '../../util/errors'

const { Title } = Typography

const ErrorOverlay = props => {
    if (!props.errorCode) {
        return null
    }

    let image
    let errorTitle
    let errorDescription
    let errorMessage

    switch (props.errorCode) {
        case Errors.NOT_FOUND:
            image = error404
            errorTitle = 'Module not found'
            errorDescription = `
                We searched through time and space but couldn't
                find the module you were looking for.
            `
            errorMessage = `
                Check your spelling and try again. Not trying to make you feel
                bad or anything, but hey, we all make mistakes. I can't tell
                you how many times I've misspelled Wednesday. Am I the only
                person who has to sound it out?
            `
            break
        case Errors.FILE_READ_ERROR:
            image = errorCone
            errorTitle = 'Error reading file'
            errorDescription = "You're file couldn't be parsed."
            errorMessage = `
                Listen, we know how to read, but words are hard sometimes.
                Are you sure the file you uploaded is valid JSON? Make sure
                your file is valid and try again.
            `
            break
        default:
            image = errorTripped
            errorTitle = 'We tripped up!'
            errorDescription = 'An unknown error occurred.'
            errorMessage = `
                Well this is awkward... Usually you're not supposed to
                see this message. Either something crazy happened, or the
                world is about to end. If the latter, why not try to knock off
                some items on your bucket list?
            `
    }

    return (
        <div className="error-overlay">
            <Empty image={image} imageStyle={{ height: '22em' }} description={null}>
                <div>
                    <Title level={2}>{errorTitle}</Title>
                    <p>{errorDescription}</p>
                    <p className="message">{errorMessage}</p>
                </div>
            </Empty>
        </div>
    )
}

const mapStateToProps = state => ({
    errorCode: state.search.errorCode
})

export default connect(mapStateToProps)(ErrorOverlay)
