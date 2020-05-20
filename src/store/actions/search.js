import {
    SEARCH,
    SEARCH_PROGRESS,
    SEARCH_FINISHED,
    SEARCH_ERROR,
    SEARCH_UPDATE_CACHE_SIZE
} from './types'
import { updateGraphData } from './graph'
import { setPackageInfo, clearPackageInfo } from './package'
import { getCacheSize } from '../../util/cache'
import API from '../../api/dependencies'

const searchStart = () => ({
    type: SEARCH
})

const searchFinished = () => ({
    type: SEARCH_FINISHED
})

const searchError = errorCode => ({
    type: SEARCH_ERROR,
    errorCode
})

const updateCacheSize = cacheSize => ({
    type: SEARCH_UPDATE_CACHE_SIZE,
    cacheSize: getCacheSize()
})

const updateSearchProgress = (packagesRemaining, packagesLoaded, packageName) => ({
    type: SEARCH_PROGRESS,
    packagesLoaded,
    packagesRemaining,
    currentPackageLoaded: packageName
})

const searchPackage = query => {
    return dispatch => {
        dispatch(searchStart())
        dispatch(clearPackageInfo())

        const onProgressUpdate = (packagesRemaining, packagesLoaded, packageName) => {
            dispatch(updateSearchProgress(packagesRemaining, packagesLoaded, packageName))
        }

        // Not using catch here since errors in dispatch
        // might trigger the catch block
        API.getDependencies(query, onProgressUpdate)
            .then(
                async graph => {
                    const data = API.graphToJson(query, graph)

                    // Query the npms api for detailed info about
                    // this package
                    try {
                        const packageInfo = await API.getPackageInfo(query)
                        dispatch(setPackageInfo(packageInfo))
                    } catch (err) {}

                    dispatch(searchFinished())
                    dispatch(updateGraphData(data))
                },
                error => {
                    dispatch(clearPackageInfo())
                    dispatch(searchError(error))
                }
            )
            .finally(() => {
                dispatch(updateCacheSize(getCacheSize()))
            })
    }
}

export { searchPackage, updateCacheSize }
