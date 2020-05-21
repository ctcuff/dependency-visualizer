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
    Popconfirm,
    message
} from 'antd'
import {
    SearchOutlined,
    MenuOutlined,
    LeftOutlined,
    DeleteOutlined
} from '@ant-design/icons'
import { connect } from 'react-redux'
import { searchPackage } from '../../store/actions/search'
import PackageInfo from '../PackageInfo'
import { clearCache } from '../../util/cache'

const { Sider } = Layout

class Menu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isOpen: false
        }

        this.onSearch = this.onSearch.bind(this)
        this.toggleMenu = this.toggleMenu.bind(this)
        this.clearCache = this.clearCache.bind(this)
    }

    toggleMenu() {
        this.setState({ isOpen: !this.state.isOpen })
    }

    onSearch(event) {
        const searchQuery = event.target.value

        if (!searchQuery.trim()) {
            return
        }

        this.props.searchPackage(searchQuery)
    }

    clearCache() {
        if (this.props.cacheSize === 0) {
            return
        }

        const itemsCleared = clearCache()
        message.success(`Cleared ${itemsCleared} entries`)
    }

    render() {
        const isCacheEmpty = this.props.cacheSize === 0

        return (
            <div className="menu">
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
                    className="sider"
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
                        <PackageInfo
                            packageInfo={this.props.packageInfo}
                            onDependencyClick={this.props.searchPackage}
                        />
                        <div className="spacer" />
                        <Popconfirm
                            icon={
                                <DeleteOutlined
                                    style={{ color: isCacheEmpty ? 'green' : 'red' }}
                                />
                            }
                            title={
                                isCacheEmpty
                                    ? 'Nothing here yet. We cache packages to speed up load times.'
                                    : 'Are you sure? Loading may be slower.'
                            }
                            placement="topLeft"
                            cancelText="Cancel"
                            onConfirm={this.clearCache}
                        >
                            <div className="clear-cache">
                                <small>
                                    Clear cache: {this.props.cacheSize.toFixed(2)} KB
                                </small>
                                <small>{localStorage.length} entries</small>
                            </div>
                        </Popconfirm>
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
    cacheSize: state.search.cacheSize,
    packageInfo: state.package.packageInfo
})

const mapDispatchToProps = {
    searchPackage
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
