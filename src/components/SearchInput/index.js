import './search-input.scss'
import React from 'react'
import { Input, AutoComplete } from 'antd'
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
            suggestions: []
        }

        this.inputRef = React.createRef()

        this.onPressEnter = this.onPressEnter.bind(this)
        this.updateInputValue = this.updateInputValue.bind(this)
        this.onSuggestionClick = this.onSuggestionClick.bind(this)
        this.onEscPress = this.onEscPress.bind(this)
        this.updatePageURL = this.updatePageURL.bind(this)
        this.searchPackageFromURL = this.searchPackageFromURL.bind(this)

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
        window.addEventListener('popstate', this.searchPackageFromURL)

        this.searchPackageFromURL()
    }

    componentWillUnmount() {
        this.unsubscribe()

        document.removeEventListener('keyup', this.onEscPress)
        window.removeEventListener('popstate', this.searchPackageFromURL)
    }

    onEscPress(event) {
        if (event.key === 'Escape') {
            this.inputRef.current.blur()
        }
    }

    updatePageURL(packageName) {
        const prevUrl = window.location.pathname + window.location.search
        const newUrl = `${window.location.pathname}?q=${encodeURIComponent(packageName)}`

        if (prevUrl !== newUrl) {
            window.history.pushState({}, '', newUrl)
        }
    }

    searchPackageFromURL() {
        // Gets the query /?q=packageName from the URL
        const params = new URLSearchParams(window.location.search)
        const query = params.get('q')

        if (query) {
            this.setState({ inputValue: query })
            this.props.searchPackage(query)
        }
    }

    updateInputValue(inputValue) {
        // inputValue in the state isn't trimmed so
        // we can allow spaces to be entered
        this.setState({ inputValue })

        inputValue = inputValue.trim()

        // Prevents re-rendering suggestions if the input contains
        // leading or trailing
        if (inputValue && this.state.inputValue.trim() !== inputValue) {
            this.setState({ suggestions: [] })
            this.getSuggestions(inputValue)
        }
    }

    onPressEnter(event) {
        const inputValue = event.target.value.trim()

        // Taking focus away from the input closes the
        // keyboard on mobile devices
        event.target.blur()

        this.updatePageURL(inputValue)
        this.props.searchPackage(inputValue)
        this.setState({ inputValue })
    }

    onSuggestionClick(packageName) {
        this.inputRef.current.blur()
        this.updatePageURL(packageName)
        this.setState({ inputValue: packageName })
        this.props.searchPackage(packageName)
    }

    getSuggestions(query) {
        API.getSuggestions(query).then(result => {
            const suggestions = result.map(suggestion => ({
                value: suggestion.name,
                label: (
                    <div className="auto-complete__item">
                        <p>{suggestion.name}</p>
                        <small>{suggestion.description}</small>
                    </div>
                )
            }))

            this.setState({ suggestions })
        })
    }

    render() {
        return (
            <AutoComplete
                className="auto-complete"
                dropdownMatchSelectWidth
                options={this.state.suggestions}
                onSelect={this.onSuggestionClick}
                value={this.state.inputValue}
                onChange={this.updateInputValue}
                onInputKeyDown={event => {
                    // Prevents clearing the input when esc is pressed
                    if (event.key === 'Escape') {
                        event.preventDefault()
                    }
                }}
                // Keeps the container from sticking on scroll.
                // See https://stackoverflow.com/questions/53862539/
                getPopupContainer={trigger => trigger.parentElement}
            >
                <Input
                    spellCheck="false"
                    autoCapitalize="false"
                    autoComplete="false"
                    placeholder="Search..."
                    size="large"
                    prefix={<SearchOutlined />}
                    onPressEnter={this.onPressEnter}
                    ref={this.inputRef}
                />
            </AutoComplete>
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
