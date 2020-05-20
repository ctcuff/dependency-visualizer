import './menu.scss'
import React from 'react'
import {
    Layout,
    Input,
    Statistic,
    Row,
    Col,
    Divider,
    Button,
    Tooltip,
    Progress
} from 'antd'
import { SearchOutlined, MenuOutlined, LeftOutlined } from '@ant-design/icons'
import { connect } from 'react-redux'
import { searchPackage } from '../../store/actions/search'

const { Sider } = Layout

class Menu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isOpen: false
        }

        this.onProgressUpdate = this.onProgressUpdate.bind(this)
        this.onSearch = this.onSearch.bind(this)
        this.renderPackageInfo = this.renderPackageInfo.bind(this)
        this.toggleMenu = this.toggleMenu.bind(this)
    }

    toggleMenu() {
        this.setState({ isOpen: !this.state.isOpen })
    }

    onProgressUpdate(packagesRemaining, packagesLoaded) {
        this.setState({ packagesRemaining, packagesLoaded })
    }

    onSearch(event) {
        const searchQuery = event.target.value

        if (!searchQuery.trim()) {
            return
        }

        this.props.searchPackage(searchQuery)
    }

    renderPackageInfo() {
        if (!this.props.packageInfo) {
            return null
        }
        const {
            name,
            description,
            version,
            dependencies,
            downloads,
            dependents,
            stars,
            forks,
            quality,
            popularity
        } = this.props.packageInfo

        const deps = Object.keys(dependencies)

        return (
            <React.Fragment>
                <div className="package-info-block">
                    <span className="label">Package</span>
                    <div className="dependency-info package-name">
                        <span className="dependency-name">{name}</span>
                        <span>{version}</span>
                    </div>
                </div>
                {description ? (
                    <div className="package-info-block">
                        <span className="label">Description</span>
                        <p className="package-info">{description}</p>
                    </div>
                ) : null}
                {stars && forks ? (
                    <div className="package-info-block">
                        <span className="label">Statistics</span>
                        <Row className="stats" justify="center" align="center">
                            <Col span={12}>
                                <Statistic title="Stars" value={stars} />
                            </Col>
                            <Col span={12}>
                                <Statistic title="Forks" value={forks} />
                            </Col>
                        </Row>
                    </div>
                ) : null}
                <div className="package-info-block">
                    <Row className="stats" justify="center" align="center">
                        <Col span={12}>
                            <Statistic title="Dependents" value={dependents} />
                        </Col>
                        <Col span={12}>
                            <Statistic title="Downloads" value={downloads} />
                        </Col>
                    </Row>
                </div>
                <div className="package-info-block">
                    <Row className="stats" justify="center" align="center" gutter={32}>
                        <Col span={12}>
                            <div className="stats-score">
                                <span className="label">Quality</span>
                                <Progress
                                    type="circle"
                                    size="small"
                                    percent={quality}
                                    className="stats-progress"
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="stats-score">
                                <span className="label">Popularity</span>
                                <Progress
                                    type="circle"
                                    size="small"
                                    percent={popularity}
                                    className="stats-progress"
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className="package-info-block">
                    <span className="label">Direct Dependencies: {deps.length}</span>
                    <div className="package-info">
                        {deps.map(key => (
                            <Tooltip
                                placement="topLeft"
                                title={`search ${key}`}
                                key={key}
                            >
                                <div
                                    className="dependency-info"
                                    onClick={() => this.props.searchPackage(key)}
                                >
                                    <span className="dependency-name">{key}</span>
                                    <span>{dependencies[key]}</span>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </React.Fragment>
        )
    }

    render() {
        return (
            <div>
                {this.state.isOpen ? (
                    <Button
                        className="menu-open-btn"
                        icon={<MenuOutlined />}
                        size="large"
                        onClick={this.toggleMenu}
                    />
                ) : null}
                <Sider
                    collapsible
                    theme="light"
                    collapsedWidth={0}
                    collapsed={this.state.isOpen}
                    className="menu"
                    width="22em"
                >
                    <Button
                        size="large"
                        icon={<LeftOutlined />}
                        className="menu-close-btn"
                        onClick={this.toggleMenu}
                    />

                    <div className="menu-content">
                        <div className="input-wrapper">
                            <Input
                                className="input-search"
                                placeholder="Search..."
                                size="large"
                                prefix={<SearchOutlined />}
                                onPressEnter={this.onSearch}
                                disabled={this.props.isLoading}
                            />
                        </div>
                        <Row className="stats" justify="center" align="middle">
                            <Col span={8}>
                                <Statistic
                                    title="Remaining"
                                    value={this.props.packagesRemaining}
                                />
                            </Col>
                            <Col span={8} className="col-divider" />
                            <Col span={8}>
                                <Statistic
                                    title="Dependencies"
                                    value={this.props.packagesLoaded}
                                />
                            </Col>
                        </Row>
                        <Divider type="horizontal" className="divider" />
                        {this.renderPackageInfo()}
                    </div>
                </Sider>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    isLoading: state.search.isLoading,
    packagesLoaded: state.search.packagesLoaded,
    packagesRemaining: state.search.packagesRemaining,
    packageInfo: state.package.packageInfo
})

const mapDispatchToProps = {
    searchPackage
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
