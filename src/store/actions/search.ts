import { updateGraphData } from './graph'
import {
    SEARCH_FINISHED,
    SEARCH_STARTED,
    SEARCH_UPDATE_CACHE_SIZE,
    SEARCH_PROGRESS,
    SEARCH_ERROR
} from './types'
import { clearPackageInfo, getPackageInfo, setPackageInfoFromJson } from './package'
import Cache from '../../util/cache'
import API from '../../api'
import Errors from '../../util/errors'
import { ActionCreator, Dispatch } from 'redux'
import { PackageJson } from './package'
import store from 'store'

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

const updateCacheSize = (entries: number, size: number): SearchAction => ({
    type: SEARCH_UPDATE_CACHE_SIZE,
    entries,
    size
})

const updateSearchProgress = (
    remaining: number,
    loaded: number,
    name: string
): SearchAction => ({
    type: SEARCH_PROGRESS,
    packagesLoaded: loaded,
    packagesRemaining: remaining,
    currentPackageLoaded: name
})

const searchPackage = (query: string): ActionCreator<void> => {
    return (dispatch: Dispatch | ActionCreator<void>) => {
        // Prevents searching for the same package twice
        if (store.getState().search.searchQuery === query) {
            return
        }

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
        API.getDependencies(query, onProgressUpdate).then(
            data => {
                const entries = Cache.getEntries()
                const size = Cache.getSize()

                dispatch(searchFinished())
                dispatch(updateGraphData(data))
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

        API.getDependenciesFromFile(json.name, dependencies, onProgressUpdate).then(
            data => {
                const entries = Cache.getEntries()
                const size = Cache.getSize()

                dispatch(searchFinished())
                dispatch(updateGraphData(data))
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
    entries: number
    size: number
}

type SearchUpdateProgress = {
    type: typeof SEARCH_PROGRESS
    packagesLoaded: number
    packagesRemaining: number
    currentPackageLoaded: string
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
