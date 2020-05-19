import { SET_PACKAGE_INFO, CLEAR_PACKAGE_INFO } from './types'

const setPackageInfo = data => {
    let stars = null
    let forks = null
    const metadata = data.collected.metadata
    const { name, description, version, dependencies } = metadata
    const { downloadsCount, dependentsCount } = data.evaluation.popularity
    const { quality, popularity } = data.score.detail

    if (data.collected.github) {
        stars = data.collected.github.starsCount
        forks = data.collected.github.forksCount
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
            popularity: Math.round(popularity * 100)
        }
    }
}

const clearPackageInfo = () => ({ type: CLEAR_PACKAGE_INFO })

export { setPackageInfo, clearPackageInfo }
