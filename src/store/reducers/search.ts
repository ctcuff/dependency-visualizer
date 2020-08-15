import {
    SEARCH_STARTED,
    SEARCH_PROGRESS,
    SEARCH_FINISHED,
    SEARCH_ERROR,
    SEARCH_UPDATE_CACHE_SIZE
} from '../actions/types'
import { SearchAction } from '../actions/search'

const initialState: SearchState = {
    isLoading: false,
    searchQuery: '',
    packagesRemaining: 0,
    packagesLoaded: 0,
    currentPackageLoaded: '',
    errorCode: null,
    cache: {
        entries: 0,
        size: 0
    }
}

const searchReducer = (state = initialState, action: SearchAction): SearchState => {
    switch (action.type) {
        case SEARCH_STARTED:
            return {
                ...state,
                isLoading: true,
                searchQuery: action.query,
                packagesRemaining: 0,
                packagesLoaded: 0,
                errorCode: null,
                currentPackageLoaded: ''
            }
        case SEARCH_PROGRESS:
            return {
                ...state,
                packagesRemaining: action.packagesRemaining,
                packagesLoaded: action.packagesLoaded,
                currentPackageLoaded: action.currentPackageLoaded
            }
        case SEARCH_FINISHED:
            return {
                ...state,
                isLoading: false,
                errorCode: null
            }
        case SEARCH_ERROR:
            return {
                ...state,
                isLoading: false,
                errorCode: action.errorCode
            }
        case SEARCH_UPDATE_CACHE_SIZE:
            return {
                ...state,
                cache: {
                    entries: action.entries,
                    size: action.size
                }
            }
        default:
            return state
    }
}

type SearchState = {
    isLoading: boolean
    searchQuery: string
    packagesLoaded: number
    packagesRemaining: number
    currentPackageLoaded: string
    errorCode: null | number
    cache: {
        entries: number
        size: number
    }
}

export default searchReducer
