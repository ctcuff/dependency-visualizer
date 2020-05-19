import { SET_PACKAGE_INFO, CLEAR_PACKAGE_INFO } from '../actions/types'

const initialState = {
    packageInfo: null
}

const packageReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_PACKAGE_INFO:
            return {
                packageInfo: {
                    ...action.packageInfo
                }
            }
        case CLEAR_PACKAGE_INFO:
            return initialState
        default:
            return state
    }
}

export default packageReducer
