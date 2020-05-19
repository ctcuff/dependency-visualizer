import { SEARCH, SEARCH_PROGRESS, SEARCH_FINISHED, SEARCH_ERROR } from './types'
import { updateGraphData } from './graph'
import { setPackageInfo, clearPackageInfo } from './package'
import API from '../../api/dependencies'

const searchFinished = () => ({
    type: SEARCH_FINISHED
})

const searchError = errorCode => ({
    type: SEARCH_ERROR,
    errorCode
})

const searchPackage = query => {
    return dispatch => {
        dispatch({ type: SEARCH })
        dispatch(clearPackageInfo())

        const onProgressUpdate = (packagesRemaining, packagesLoaded, packageName) => {
            dispatch({
                type: SEARCH_PROGRESS,
                packagesLoaded,
                packagesRemaining,
                currentPackageLoaded: packageName
            })
        }

        // Not using catch here since errors in dispatch
        // might trigger the catch block
        API.getDependencies(query, onProgressUpdate)
            .then(
                async graph => {
                    const data = API.graphToJson(query, graph)

                    try {
                        const packageInfo = await API.getPackageInfo(query)
                        dispatch(setPackageInfo(packageInfo))
                    } catch (err) {
                    }

                    dispatch(searchFinished())
                    dispatch(updateGraphData(data))
                },
                error => {
                    dispatch(clearPackageInfo())
                    dispatch(searchError(error))
                }
            )
    }
}

export { searchPackage }
