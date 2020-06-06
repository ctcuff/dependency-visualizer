import {
    SEARCH_STARTED,
    SEARCH_PROGRESS,
    SEARCH_FINISHED,
    SEARCH_ERROR,
    SEARCH_UPDATE_CACHE_SIZE
} from './types'
import { updateGraphData } from './graph'
import { clearPackageInfo, getPackageInfo, setPackageInfoFromJson } from './package'
import { graphToJson } from '../../util/graph'
import Cache from '../../util/cache'
import API from '../../api'
import Errors from '../../util/errors'

const searchStart = query => ({
    type: SEARCH_STARTED,
    query
})

const searchFinished = () => ({
    type: SEARCH_FINISHED
})

const searchError = errorCode => ({
    type: SEARCH_ERROR,
    errorCode
})

const updateCacheSize = (entries, size) => ({
    type: SEARCH_UPDATE_CACHE_SIZE,
    entries,
    size
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
        API.getDependencies(query, onProgressUpdate).then(
            async graph => {
                const data = graphToJson(query, graph)
                dispatch(searchFinished())
                dispatch(updateGraphData(data))

                const entries = await Cache.entries()
                const size = await Cache.size()
                dispatch(updateCacheSize(entries, size))
            },
            error => {
                // eslint-disable-next-line no-console
                console.error(error)
                dispatch(searchError(Errors.NOT_FOUND))
            }
        )
    }
}

const getDependenciesFromJsonFile = json => {
    return dispatch => {
        const onProgressUpdate = (packagesRemaining, packagesLoaded, packageName) => {
            dispatch(updateSearchProgress(packagesRemaining, packagesLoaded, packageName))
        }

        const dependencies = Object.keys(json.dependencies)

        dispatch(setPackageInfoFromJson(json))

        API.getDependenciesFromFile(json.name, dependencies, onProgressUpdate).then(
            async graph => {
                const data = graphToJson(json.name, graph)
                dispatch(searchFinished())
                dispatch(updateGraphData(data))

                const entries = await Cache.entries()
                const size = await Cache.size()
                dispatch(updateCacheSize(entries, size))
            },
            error => {
                // eslint-disable-next-line no-console
                console.error(error)
                dispatch(searchError(Errors.FILE_READ_ERROR))
            }
        )
    }
}

export {
    searchPackage,
    updateCacheSize,
    getDependenciesFromJsonFile,
    searchStart,
    searchFinished,
    searchError
}
