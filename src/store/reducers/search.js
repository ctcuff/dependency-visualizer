import {
    SEARCH,
    SEARCH_PROGRESS,
    SEARCH_FINISHED,
    SEARCH_ERROR,
    SEARCH_UPDATE_CACHE_SIZE
} from '../actions/types'
import { getCacheSize } from '../../util/cache'

const initialState = {
    isLoading: false,
    searchQuery: '',
    packagesRemaining: 0,
    packagesLoaded: 0,
    currentPackageLoaded: '',
    errorCode: null,
    cacheSize: getCacheSize()
}

const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEARCH:
            return {
                ...state,
                isLoading: true,
                searchQuery: action.query,
                packagesRemaining: 0,
                packagesLoaded: 0,
                errorCode: null
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
                cacheSize: action.cacheSize
            }
        default:
            return state
    }
}

export default searchReducer
