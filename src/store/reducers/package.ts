import {
    SET_PACKAGE_INFO,
    CLEAR_PACKAGE_INFO,
    PACKAGE_INFO_ERROR,
    PACKAGE_INFO_SEARCH_START
} from '../actions/types'
import { PackageDetails, PackageAction } from '../actions/package'

const initialState: PackageState = {
    errorCode: null,
    isLoading: false,
    packageInfo: null
}

const packageReducer = (state = initialState, action: PackageAction): PackageState => {
    switch (action.type) {
        case SET_PACKAGE_INFO:
            return {
                ...initialState,
                packageInfo: {
                    ...action.packageInfo
                }
            }
        case CLEAR_PACKAGE_INFO:
            return {
                ...initialState
            }
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

type PackageState = {
    errorCode: number | null
    isLoading: boolean
    packageInfo: PackageDetails | null
}

export default packageReducer
