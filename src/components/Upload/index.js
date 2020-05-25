import './upload.scss'
import React from 'react'
import { Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import semver from 'semver'
import { connect } from 'react-redux'
import { getDependenciesFromJsonFile } from '../../store/actions/search'
import { setPackageInfo } from '../../store/actions/package'
import { searchStart, searchFinished } from '../../store/actions/search'

class Upload extends React.Component {
    constructor(props) {
        super(props)
        this.inputRef = React.createRef()

        this.triggerUpload = this.triggerUpload.bind(this)
        this.readFile = this.readFile.bind(this)
        this.uploadStart = this.uploadStart.bind(this)
        this.onFileLoaded = this.onFileLoaded.bind(this)

        if (window.FileReader) {
            this.fileReader = new FileReader()
        }
    }

    triggerUpload() {
        this.inputRef.click()
    }

    uploadStart() {
        console.log('Load started')
        this.props.searchStart()
    }

    onFileLoaded() {
        // Reset the input value so users can upload the same
        // file multiple times
        this.inputRef.value = null

        const content = this.fileReader.result

        try {
            const json = JSON.parse(content)
            console.log(JSON.stringify(json.dependencies, null, 3))
            if (!json.dependencies) {
                message.info('package.json file has no dependencies block')
                return
            }
            this.props.getDependenciesFromJsonFile(json)
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err)
            message.error('Error parsing file')
        }
    }

    readFile() {
        if (!this.inputRef.files || !this.inputRef.files[0]) {
            return
        }

        this.fileReader.readAsText(this.inputRef.files[0])
        this.fileReader.onloadstart = this.uploadStart
        this.fileReader.onloadend = this.uploadEnd
        this.fileReader.onload = this.onFileLoaded

        this.fileReader.onerror = err => {
            console.error(err)
            message.error('Error reading file')
        }
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
                    ref={ref => (this.inputRef = ref)}
                    onChange={this.readFile}
                />
                <Button
                    icon={<UploadOutlined />}
                    onClick={this.triggerUpload}
                    // disabled={this.props.isLoading || this.props.isGraphRendering}
                >
                    Upload package.json
                </Button>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    isGraphRendering: state.graph.isRendering,
    isLoading: state.search.isLoading
})

const mapDispatchToProps = {
    getDependenciesFromJsonFile,
    searchStart,
    searchFinished
}

export default connect(mapStateToProps, mapDispatchToProps)(Upload)
