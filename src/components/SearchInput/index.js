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
        this.onSearch = this.onSearch.bind(this)
        this.updateInputValue = this.updateInputValue.bind(this)
        this.onSuggestionClick = this.onSuggestionClick.bind(this)
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
        let inputValue = event.target.value.trim()

        this.setState({ inputValue })

        if (inputValue && this.state.inputValue !== inputValue) {
            this.setState({ suggestions: [] })
            this.getSuggestions(inputValue)
        }
    }

    onSearch(event) {
        const inputValue = event.target.value.trim()

        // Taking focus away from the input closes the
        // keyboard on mobile devices
        event.target.blur()

        this.props.searchPackage(inputValue)
        this.setState({ inputValue })
    }

    onSuggestionClick(packageName) {
        this.inputRef.current.blur()
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
                options={(this.state.inputValue && this.state.suggestions) || []}
                onSelect={this.onSuggestionClick}
                // Keeps the container from sticking on scroll.
                // See https://stackoverflow.com/questions/53862539/
                getPopupContainer={trigger => trigger.parentElement}
            >
                <Input
                    spellCheck="false"
                    autoCapitalize="false"
                    autoComplete="false"
                    value={this.state.inputValue}
                    placeholder="Search..."
                    size="large"
                    prefix={<SearchOutlined />}
                    onPressEnter={this.onSearch}
                    onChange={this.updateInputValue}
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
