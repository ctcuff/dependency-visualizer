import { updateGraphData } from './graph'
import {
    SEARCH_FINISHED,
    SEARCH_STARTED,
    SEARCH_UPDATE_CACHE_SIZE,
    SEARCH_PROGRESS,
    SEARCH_ERROR
} from './types'
import { clearPackageInfo, getPackageInfo, setPackageInfoFromJson } from './package'
import { getCacheSize } from '../../util/cache'
import API from '../../api/dependencies'
import Errors from '../../util/errors'
import { ActionCreator, Dispatch } from 'redux'
import { PackageJson } from './package'

type SearchStart = {
    type: typeof SEARCH_STARTED
    query: string
}

type SearchFinished = {
    type: typeof SEARCH_FINISHED
}

type SearchError = {
    type: typeof SEARCH_ERROR
    errorCode: number
}

type SearchUpdateCache = {
    type: typeof SEARCH_UPDATE_CACHE_SIZE
    cacheSize: number
}

type SearchUpdateProgress = {
    type: typeof SEARCH_PROGRESS
    packagesLoaded: number
    packagesRemaining: number
    currentPackageLoaded: string
}

const searchStart = (query: string): SearchAction => ({
    type: SEARCH_STARTED,
    query
})

const searchFinished = (): SearchAction => ({
    type: SEARCH_FINISHED
})

const searchError = (errorCode: number): SearchAction => ({
    type: SEARCH_ERROR,
    errorCode
})

const updateCacheSize = (): SearchAction => ({
    type: SEARCH_UPDATE_CACHE_SIZE,
    cacheSize: getCacheSize()
})

// prettier-ignore
const updateSearchProgress = (remaining: number, loaded: number, name: string): SearchAction => ({
    type: SEARCH_PROGRESS,
    packagesLoaded: loaded,
    packagesRemaining: remaining,
    currentPackageLoaded: name
})

const searchPackage = (query: string): ActionCreator<void> => {
    return (dispatch: Dispatch | ActionCreator<void>) => {
        dispatch(clearPackageInfo())
        dispatch(searchStart(query))
        dispatch(getPackageInfo(query))

        const onProgressUpdate = (
            packagesRemaining: number,
            packagesLoaded: number,
            packageName: string
        ) => {
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
                    dispatch(searchError(Errors.NOT_FOUND))
                }
            )
            .finally(() => {
                dispatch(updateCacheSize())
            })
    }
}

const getDependenciesFromJsonFile = (json: PackageJson): ActionCreator<void> => {
    return (dispatch: Dispatch) => {
        const onProgressUpdate = (
            packagesRemaining: number,
            packagesLoaded: number,
            packageName: string
        ) => {
            dispatch(updateSearchProgress(packagesRemaining, packagesLoaded, packageName))
        }

        const dependencies = Object.keys(json.dependencies)
        dispatch(setPackageInfoFromJson(json))

        API.getDependenciesFromFile(json.name, dependencies, onProgressUpdate)
            .then(
                graph => {
                    const data = API.graphToJson(json.name, graph)
                    dispatch(searchFinished())
                    dispatch(updateGraphData(data))
                },
                error => {
                    // eslint-disable-next-line no-console
                    console.error(error)
                    dispatch(searchError(Errors.FILE_READ_ERROR))
                }
            )
            .finally(() => {
                dispatch(updateCacheSize())
            })
    }
}

export type SearchAction =
    | SearchStart
    | SearchFinished
    | SearchError
    | SearchUpdateCache
    | SearchUpdateProgress

export {
    searchPackage,
    updateCacheSize,
    getDependenciesFromJsonFile,
    searchStart,
    searchFinished,
    searchError
}
