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
    DeleteOutlined,
    GithubFilled
} from '@ant-design/icons'
import { connect } from 'react-redux'
import { searchPackage } from '../../store/actions/search'
import PackageInfo from '../PackageInfo'
import { clearCache } from '../../util/cache'
import debounce from '../../util/debounce'
import Upload from '../Upload'
import watch from 'redux-watch'
import store from '../../store'

const { Sider } = Layout

// The width (in px) needed before the
// menu takes up the entire screen
const MOBILE_BREAKPOINT = 650

class Menu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isOpen: window.innerWidth <= MOBILE_BREAKPOINT,
            isMobile: window.innerWidth <= MOBILE_BREAKPOINT,
            inputValue: ''
        }

        this.onSearch = this.onSearch.bind(this)
        this.toggleMenu = this.toggleMenu.bind(this)
        this.clearCache = this.clearCache.bind(this)
        this.onResize = debounce(this.onResize.bind(this), 500)
        this.renderConfirmPopper = this.renderConfirmPopper.bind(this)
        this.updateInput = this.updateInput.bind(this)

        const watcher = watch(store.getState, 'search.searchQuery')

        // Since clicking on a dependency in the menu starts a search
        // with a new query, we need to watch part of the store to
        // make sure the search input value updates
        this.unsubscribe = store.subscribe(
            watcher(newValue => this.setState({ inputValue: newValue }))
        )
    }

    componentDidMount() {
        window.addEventListener('resize', this.onResize)
    }

    componentWillUnmount() {
        this.unsubscribe()
        window.removeEventListener('resize', this.onResize)
    }

    toggleMenu() {
        this.setState({ isOpen: !this.state.isOpen })
    }

    onSearch(event) {
        const inputValue = event.target.value.trim()

        // Prevent searching for a package that was just searched
        if (!inputValue || inputValue === this.props.searchQuery) {
            return
        }

        // Taking focus away from the input closes the
        // keyboard on mobile devices
        event.target.blur()

        this.props.searchPackage(inputValue)
        this.setState({ inputValue })
    }

    updateInput(event) {
        this.setState({ inputValue: event.target.value })
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
                <div className="menu-footer">
                    <small>Clear cache: {this.props.cacheSize.toFixed(2)} KB</small>
                    <small>{localStorage.length} entries</small>
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
                        <div className="input-wrapper">
                            <Input
                                value={this.state.inputValue}
                                className="input-search"
                                placeholder="Search..."
                                size="large"
                                prefix={<SearchOutlined />}
                                onPressEnter={this.onSearch}
                                onChange={this.updateInput}
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
    cacheSize: state.search.cacheSize,
    searchQuery: state.search.searchQuery
})

const mapDispatchToProps = {
    searchPackage
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
