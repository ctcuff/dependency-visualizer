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
import debounce from '../../util/debounce'
import Upload from '../Upload'

const { Sider } = Layout

// The width (in px) needed before the
// menu takes up the entire screen
const MOBILE_BREAKPOINT = 650

class Menu extends React.Component {
    constructor(props) {
        super(props)
        this.menuRef = React.createRef()

        this.state = {
            isOpen: window.innerWidth <= MOBILE_BREAKPOINT,
            isMobile: window.innerWidth <= MOBILE_BREAKPOINT
        }

        this.onSearch = this.onSearch.bind(this)
        this.toggleMenu = this.toggleMenu.bind(this)
        this.clearCache = this.clearCache.bind(this)
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

    onSearch(event) {
        const searchQuery = event.target.value

        if (!searchQuery.trim()) {
            return
        }

        this.props.searchPackage(searchQuery.trim())
    }

    clearCache() {
        if (this.props.cacheSize === 0) {
            return
        }

        const itemsCleared = clearCache()
        message.success(`Cleared ${itemsCleared} entries`)
    }

    onResize() {
        this.setState({ isMobile: window.innerWidth <= MOBILE_BREAKPOINT })
    }

    renderConfirmPopper() {
        const isCacheEmpty = this.props.cacheSize === 0

        return (
            <Popconfirm
                icon={
                    <DeleteOutlined style={{ color: isCacheEmpty ? 'green' : 'red' }} />
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
                    <small>Clear cache: {this.props.cacheSize.toFixed(2)} KB</small>
                    <small>{localStorage.length} entries</small>
                </div>
            </Popconfirm>
        )
    }

    render() {
        return (
            <div className="menu" ref={ref => (this.menuRef = ref)}>
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
                        {this.renderConfirmPopper()}
                        <Upload />
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
    cacheSize: state.search.cacheSize
})

const mapDispatchToProps = {
    searchPackage
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
