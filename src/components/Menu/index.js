import './menu.scss'
import React from 'react'
import { Layout, Statistic, Row, Col, Divider, Button, Popconfirm } from 'antd'
import {
    MenuOutlined,
    LeftOutlined,
    DeleteOutlined,
    GithubFilled
} from '@ant-design/icons'
import { connect } from 'react-redux'
import { searchPackage } from '../../store/actions/search'
import PackageInfo from '../PackageInfo'
import Cache from '../../util/cache'
import debounce from '../../util/debounce'
import Upload from '../Upload'
import SearchInput from '../SearchInput'

const { Sider } = Layout

// The width (in px) needed before the
// menu takes up the entire screen
const MOBILE_BREAKPOINT = 650

class Menu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isOpen: window.innerWidth <= MOBILE_BREAKPOINT,
            isMobile: window.innerWidth <= MOBILE_BREAKPOINT
        }

        this.toggleMenu = this.toggleMenu.bind(this)
        this.onResize = debounce(this.onResize.bind(this), 500)
        this.renderConfirmPopper = this.renderConfirmPopper.bind(this)
    }

    componentDidMount() {
        window.addEventListener('resize', this.onResize)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize)
    }

    toggleMenu() {
        this.setState({ isOpen: !this.state.isOpen })
    }

    onResize() {
        this.setState({ isMobile: window.innerWidth <= MOBILE_BREAKPOINT })
    }

    renderConfirmPopper() {
        if (this.props.cache.entries === 0 || this.props.cache.size === 0) {
            return null
        }

        return (
            <Popconfirm
                icon={<DeleteOutlined style={{ color: 'red' }} />}
                title="'Are you sure? Loading will be slower."
                placement="topLeft"
                cancelText="Cancel"
                onConfirm={Cache.clear}
            >
                <div className="menu-footer">
                    <small>Clear cache: {this.props.cache.size.toFixed(2)} KB</small>
                    <small>{this.props.cache.entries} entries</small>
                </div>
            </Popconfirm>
        )
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
                    width={this.state.isMobile ? '100vw' : '22em'}
                    trigger={null}
                >
                    <Button
                        size="large"
                        icon={<LeftOutlined />}
                        className="menu-close-btn"
                        onClick={this.toggleMenu}
                    />

                    <div className="menu-content">
                        <SearchInput />
                        <Row className="stats" justify="center" align="middle">
                            <Col span={12}>
                                <Statistic
                                    title="All Dependencies"
                                    value={this.props.packagesLoaded}
                                />
                            </Col>
                            <Col span={12} className="stat-remaining">
                                <Statistic
                                    title="Remaining"
                                    value={this.props.packagesRemaining}
                                />
                            </Col>
                        </Row>
                        <Divider type="horizontal" className="divider" />
                        <PackageInfo onDependencyClick={this.props.searchPackage} />
                        <Upload />
                        {this.renderConfirmPopper()}
                        <div className="menu-footer">
                            <small>
                                <a
                                    href="https://github.com/ctcuff/dependency-visualizer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View source on GitHub
                                </a>
                            </small>
                            <small>
                                <GithubFilled />
                            </small>
                        </div>
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
    cache: state.search.cache
})

const mapDispatchToProps = {
    searchPackage
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
