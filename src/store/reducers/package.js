import {
    SET_PACKAGE_INFO,
    CLEAR_PACKAGE_INFO,
    PACKAGE_INFO_ERROR,
    PACKAGE_INFO_SEARCH_START
} from '../actions/types'

const initialState = {
    errorCode: null,
    isLoading: false,
    packageInfo: null
}

const packageReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_PACKAGE_INFO:
            return {
                ...initialState,
                packageInfo: {
                    ...action.packageInfo
                }
            }
        case CLEAR_PACKAGE_INFO:
            return initialState
        case PACKAGE_INFO_SEARCH_START:
            return {
                ...initialState,
                isLoading: true
            }
        case PACKAGE_INFO_ERROR:
            return {
                ...initialState,
                errorCode: action.errorCode
            }
        default:
            return state
    }
}

export default packageReducer
