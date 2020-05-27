import './upload.scss'
import React from 'react'
import { Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { connect } from 'react-redux'
import { getDependenciesFromJsonFile } from '../../store/actions/search'
import { searchStart, searchFinished, searchError } from '../../store/actions/search'
import { clearPackageInfo } from '../../store/actions/package'
import Errors from '../../util/errors'

class Upload extends React.Component {
    constructor(props) {
        super(props)
        this.inputRef = React.createRef()

        this.triggerUpload = this.triggerUpload.bind(this)
        this.readFile = this.readFile.bind(this)
        this.uploadStart = this.uploadStart.bind(this)
        this.onFileLoaded = this.onFileLoaded.bind(this)
        this.onError = this.onError.bind(this)

        if (window.FileReader) {
            this.fileReader = new FileReader()
        }
    }

    triggerUpload() {
        this.inputRef.current.click()
    }

    uploadStart() {
        // Dispatch searchStart to show the loading overlay
        this.props.searchStart()
        this.props.clearPackageInfo()
    }

    onError(err) {
        // eslint-disable-next-line no-console
        console.error(err)
        this.props.searchError(Errors.FILE_READ_ERROR)
    }

    onFileLoaded() {
        // Reset the input value so users can
        // upload the same file multiple times
        this.inputRef.current.value = null

        const content = this.fileReader.result

        try {
            const json = JSON.parse(content)

            if (!json.dependencies) {
                throw new Error('This file has no dependencies field')
            }

            if (!json.name) {
                throw new Error('This file must have a name field')
            }

            // This could really only occur if the user tries to upload a
            // package-lock.json file, since its dependencies are objects
            // instead of strings
            for (const dep in json.dependencies) {
                if (typeof json.dependencies[dep] !== 'string') {
                    throw new Error('Every dependency must be a string')
                }
            }

            this.props.getDependenciesFromJsonFile(json)
        } catch (err) {
            this.props.searchError(Errors.FILE_READ_ERROR)
            message.error(err.message)
        }
    }

    readFile() {
        const input = this.inputRef.current

        if (!input.files || !input.files[0]) {
            return
        }

        this.fileReader.onloadstart = this.uploadStart
        this.fileReader.onload = this.onFileLoaded
        this.fileReader.onerror = this.onError

        this.fileReader.readAsText(input.files[0])
    }

    render() {
        if (!window.FileReader) {
            return null
        }

        return (
            <div className="upload">
                <input
                    hidden
                    type="file"
                    accept="application/JSON"
                    ref={this.inputRef}
                    onChange={this.readFile}
                />
                <Button icon={<UploadOutlined />} onClick={this.triggerUpload}>
                    Upload package.json
                </Button>
            </div>
        )
    }
}

const mapDispatchToProps = {
    getDependenciesFromJsonFile,
    searchStart,
    searchFinished,
    searchError,
    clearPackageInfo
}

export default connect(null, mapDispatchToProps)(Upload)
