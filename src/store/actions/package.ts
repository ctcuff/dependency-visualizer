import {
    SET_PACKAGE_INFO,
    CLEAR_PACKAGE_INFO,
    PACKAGE_INFO_ERROR,
    PACKAGE_INFO_SEARCH_START
} from './types'
import Errors from '../../util/errors'
import { ActionCreator, Dispatch } from 'redux'

// data is the JSON response returned from the api.npms.io
const setPackageInfo = (data: any): PackageAction => {
    let stars = null
    let forks = null
    let links = {}
    const metadata = data.collected.metadata
    const { name, description, version, dependencies } = metadata
    const { downloadsCount, dependentsCount } = data.evaluation.popularity
    const { quality, popularity } = data.score.detail

    if (data.collected.github) {
        stars = data.collected.github.starsCount
        forks = data.collected.github.forksCount
    }

    if (data.collected.metadata.links) {
        links = data.collected.metadata.links
    }

    return {
        type: SET_PACKAGE_INFO,
        packageInfo: {
            name,
            description,
            version,
            dependencies: dependencies || [],
            downloads: Math.floor(downloadsCount),
            dependents: Math.floor(dependentsCount),
            stars,
            forks,
            quality: Math.round(quality * 100),
            popularity: Math.round(popularity * 100),
            links
        }
    }
}

const setPackageInfoFromJson = (json: PackageJson): PackageAction => {
    const { name, version, dependencies, description, homepage } = json
    let links = null

    if (homepage) {
        links = {
            homepage: json.homepage
        }
    }

    return {
        type: SET_PACKAGE_INFO,
        packageInfo: {
            name,
            version: version || 'Unknown',
            dependencies,
            description,
            links,
            stars: null,
            forks: null,
            quality: null,
            popularity: null,
            downloads: null,
            dependents: null
        }
    }
}

const packageSearchStart = (): PackageAction => ({
    type: PACKAGE_INFO_SEARCH_START
})

const packageInfoError = (errorCode: number): PackageAction => ({
    type: PACKAGE_INFO_ERROR,
    errorCode
})

const getPackageInfo = (packageName: string): ActionCreator<void> => {
    return (dispatch: Dispatch) => {
        dispatch(packageSearchStart())

        fetch(`https://api.npms.io/v2/package/${encodeURIComponent(packageName)}`).then(
            async res => {
                if (res.status !== 200) {
                    dispatch(packageInfoError(res.status))
                    return
                }
                const data = await res.json()
                dispatch(setPackageInfo(data))
            },
            error => {
                // eslint-disable-next-line no-console
                console.error(error)
                // Some unknown error occurred
                dispatch(packageInfoError(Errors.UNKNOWN_ERROR))
            }
        )
    }
}

const clearPackageInfo = (): PackageAction => ({
    type: CLEAR_PACKAGE_INFO
})

type PackageSetInfo = {
    type: typeof SET_PACKAGE_INFO
    packageInfo: PackageDetails
}

type PackageError = {
    type: typeof PACKAGE_INFO_ERROR
    errorCode: number
}

type PackageSearchStart = {
    type: typeof PACKAGE_INFO_SEARCH_START
}

type PackageClearInfo = {
    type: typeof CLEAR_PACKAGE_INFO
}

export type PackageAction =
    | PackageSetInfo
    | PackageError
    | PackageSearchStart
    | PackageClearInfo

export type PackageJson = {
    name: string
    version: string
    dependencies: string[]
    description: string
    homepage: string
}

export type PackageDetails = {
    name: string
    version: string
    description: string
    dependencies: string[]
    downloads: number | null
    dependents: number | null
    stars: number | null
    forks: number | null
    quality: number | null
    popularity: number | null
    links: { [key: string]: string } | null
}

export { setPackageInfo, clearPackageInfo, getPackageInfo, setPackageInfoFromJson }
