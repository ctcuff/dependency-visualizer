import {
    SET_PACKAGE_INFO,
    CLEAR_PACKAGE_INFO,
    PACKAGE_INFO_ERROR,
    PACKAGE_INFO_SEARCH_START
} from './types'

const setPackageInfo = data => {
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

const setPackageInfoFromJson = json => ({
    type: SET_PACKAGE_INFO,
    packageInfo: {
        name: json.name,
        version: json.version,
        dependencies: json.dependencies,
        stars: null,
        forks: null,
        quality: null,
        popularity: null,
        downloads: null,
        dependents: null
    }
})

const searchStart = () => ({
    type: PACKAGE_INFO_SEARCH_START
})

const packageInfoError = errorCode => ({
    type: PACKAGE_INFO_ERROR,
    errorCode
})

const getPackageInfo = packageName => {
    return dispatch => {
        dispatch(searchStart())

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
                dispatch(packageInfoError(-1))
            }
        )
    }
}

const clearPackageInfo = () => ({ type: CLEAR_PACKAGE_INFO })

export { setPackageInfo, clearPackageInfo, getPackageInfo, setPackageInfoFromJson }