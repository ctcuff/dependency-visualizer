import './upload.scss'
import React from 'react'
import { Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import semver from 'semver'
import { connect } from 'react-redux'
import { getDependenciesFromJsonFile } from '../../store/actions/search'
import { setPackageInfo } from '../../store/actions/package'

class Upload extends React.Component {
    constructor(props) {
        super(props)
        this.inputRef = React.createRef()
        this.triggerUpload = this.triggerUpload.bind(this)
        this.readFile = this.readFile.bind(this)
        this.fileReader = new FileReader()

        this.state = {
            isLoading: false
        }
    }

    triggerUpload() {
        this.inputRef.click()
    }

    readFile() {
        if (!this.inputRef.files || !this.inputRef.files[0]) {
            return
        }

        this.fileReader.readAsText(this.inputRef.files[0])
        this.fileReader.onloadstart = () => this.setState({ isLoading: true })
        this.fileReader.onloadend = () => this.setState({ isLoading: false })

        this.fileReader.onload = result => {
            const content = this.fileReader.result
            try {
                const json = JSON.parse(content)
                console.log(json)
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

        this.fileReader.onerror = err => {
            this.setState({ isLoading: false })
            message.error('Error reading file')
        }
    }

    render() {
        if (!window.FileReader) {
            return null
        }

        return (
            <React.Fragment>
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
                    disabled={this.state.isLoading}
                >
                    Upload package.json
                </Button>
            </React.Fragment>
        )
    }
}

const mapDispatchToProps = {
    getDependenciesFromJsonFile
}

export default connect(null, mapDispatchToProps)(Upload)
