import './search-input.scss'
import React from 'react'
import { Input, Menu } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import watch from 'redux-watch'
import store from '../../store'
import { searchPackage } from '../../store/actions/search'
import { connect } from 'react-redux'
import debounce from '../../util/debounce'
import API from '../../api'

class SearchInput extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            inputValue: '',
            isInputFocused: false,
            suggestions: []
        }

        this.inputRef = React.createRef()
        this.onSearch = this.onSearch.bind(this)
        this.updateInputValue = this.updateInputValue.bind(this)
        this.onInputFocus = this.onInputFocus.bind(this)
        this.onInputBlur = this.onInputBlur.bind(this)
        this.renderSuggestions = this.renderSuggestions.bind(this)
        this.onMenuItemClick = this.onMenuItemClick.bind(this)
        this.onEscPress = this.onEscPress.bind(this)

        this.getSuggestions = debounce(this.getSuggestions.bind(this), 250)

        const watcher = watch(store.getState, 'search.searchQuery')

        // Since clicking on a dependency in the menu starts a search
        // with a new query, we need to watch part of the store to
        // make sure the search input value updates
        this.unsubscribe = store.subscribe(
            watcher(newValue => this.setState({ inputValue: newValue || '' }))
        )
    }

    componentDidMount() {
        document.addEventListener('keyup', this.onEscPress)
    }

    componentWillUnmount() {
        this.unsubscribe()
        document.removeEventListener('keyup', this.onEscPress)
    }

    onEscPress(event) {
        if (event.key === 'Escape') {
            this.inputRef.current.blur()
        }
    }

    updateInputValue(event) {
        const inputValue = event.target.value.trim()
        this.setState({ inputValue })

        if (inputValue) {
            this.getSuggestions(inputValue)
        }
    }

    onInputFocus() {
        this.setState({ isInputFocused: true })
    }

    onInputBlur() {
        // The input looses focus before a menu item is clicked
        // so we need to delay focus loss to let the menu
        // click listener fire first
        setTimeout(() => {
            this.setState({ isInputFocused: false })
        }, 150)
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

    onMenuItemClick(event) {
        const packageName = event.item.props.packagename
        this.setState({ inputValue: packageName })
        this.props.searchPackage(packageName)
    }

    getSuggestions(query) {
        // Set state with a callback to make sure suggestions are
        // cleared before new suggestions are loaded
        this.setState({ suggestions: [] }, () => {
            API.getSuggestions(query).then(suggestions => this.setState({ suggestions }))
        })
    }

    renderSuggestions() {
        if (
            !this.state.inputValue.trim() ||
            !this.state.isInputFocused ||
            this.state.suggestions.length === 0
        ) {
            return null
        }

        // Pass in our own packagename prop to each menu item
        // so we can read it when a menu item is clicked
        return (
            <Menu onClick={this.onMenuItemClick} className="search-input--menu">
                {this.state.suggestions.map((item, index) => (
                    <Menu.Item
                        key={index}
                        packagename={item.name}
                        className="search-input--menu-item"
                    >
                        {item.name}
                        <small>{item.description}</small>
                    </Menu.Item>
                ))}
            </Menu>
        )
    }

    render() {
        return (
            <div className="search-input">
                <Input
                    value={this.state.inputValue}
                    className="input-search"
                    placeholder="Search..."
                    size="large"
                    prefix={<SearchOutlined />}
                    onPressEnter={this.onSearch}
                    onChange={this.updateInputValue}
                    ref={this.inputRef}
                    onBlur={this.onInputBlur}
                    onFocus={this.onInputFocus}
                />
                {this.renderSuggestions()}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    searchQuery: state.search.searchQuery
})

const mapDispatchToProps = {
    searchPackage
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchInput)
