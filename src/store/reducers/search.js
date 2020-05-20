import { SEARCH, SEARCH_PROGRESS, SEARCH_FINISHED, SEARCH_ERROR } from '../actions/types'

const initialState = {
    isLoading: false,
    searchQuery: '',
    packagesRemaining: 0,
    packagesLoaded: 0,
    currentPackageLoaded: '',
    errorCode: null
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
        default:
            return state
    }
}

export default searchReducer
