import {
    SEARCH_STARTED,
    SEARCH_PROGRESS,
    SEARCH_FINISHED,
    SEARCH_ERROR,
    SEARCH_UPDATE_CACHE_SIZE
} from './types'
import { updateGraphData } from './graph'
import { clearPackageInfo, getPackageInfo, setPackageInfoFromJson } from './package'
import { getCacheSize } from '../../util/cache'
import API from '../../api/dependencies'
import debounce from '../../util/debounce'

const searchStart = query => {
    console.log('Search started')
    return {
        type: SEARCH_STARTED,
        query
    }
}

const searchFinished = () => {
    console.log('Search finishe')
    return {
        type: SEARCH_FINISHED
    }
}

const searchError = errorCode => ({
    type: SEARCH_ERROR,
    errorCode
})

const updateCacheSize = () => ({
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
        dispatch(clearPackageInfo())
        dispatch(searchStart(query))
        dispatch(getPackageInfo(query))

        const onProgressUpdate = (packagesRemaining, packagesLoaded, packageName) => {
            dispatch(updateSearchProgress(packagesRemaining, packagesLoaded, packageName))
        }

        // Not using catch here since errors in dispatch
        // might trigger the catch block
        API.getDependencies(query, onProgressUpdate)
            .then(
                async graph => {
                    const data = API.graphToJson(query, graph)
                    dispatch(searchFinished())
                    dispatch(updateGraphData(data))
                },
                error => {
                    // eslint-disable-next-line no-console
                    console.error(error)
                    dispatch(searchError(error))
                }
            )
            .finally(() => {
                dispatch(updateCacheSize())
            })
    }
}

const getDependenciesFromJsonFile = json => {
    return dispatch => {
        dispatch(clearPackageInfo())
        dispatch(searchStart(json.name))

        const onProgressUpdate = (packagesRemaining, packagesLoaded, packageName) => {
            dispatch(updateSearchProgress(packagesRemaining, packagesLoaded, packageName))
        }

        const dependencies = Object.keys(json.dependencies)

        // Not using catch here since errors in dispatch
        // might trigger the catch block
        API.getDependenciesFromFile(json.name, dependencies, onProgressUpdate)
            .then(
                async graph => {
                    const data = API.graphToJson(json.name, graph)
                    dispatch(searchFinished())
                    dispatch(updateGraphData(data))
                    dispatch(setPackageInfoFromJson(json))
                },
                error => {
                    // eslint-disable-next-line no-console
                    console.error(error)
                    dispatch(searchError(error))
                }
            )
            .finally(() => {
                dispatch(updateCacheSize())
            })
    }
}

export { searchPackage, updateCacheSize, getDependenciesFromJsonFile, searchStart, searchFinished }
