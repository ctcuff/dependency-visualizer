import './menu.scss'
import React from 'react'
import { Layout, Input, Statistic, Row, Col, Divider, Button } from 'antd'
import { SearchOutlined, MenuOutlined, LeftOutlined } from '@ant-design/icons'
import { connect } from 'react-redux'
import { searchPackage } from '../../store/actions/search'
import PackageInfo from '../PackageInfo'

const { Sider } = Layout

class Menu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isOpen: false
        }

        this.onProgressUpdate = this.onProgressUpdate.bind(this)
        this.onSearch = this.onSearch.bind(this)
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

    render() {
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
