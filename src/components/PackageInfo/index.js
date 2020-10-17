import './package-info.scss'
import React from 'react'
import { Row, Col, Progress, Statistic, Collapse, Divider } from 'antd'
import { connect } from 'react-redux'
import Errors from '../../util/errors'
import { searchPackage } from '../../store/actions/search'

const { Panel } = Collapse

const PackageLinks = props => {
    if (!props.links) {
        return null
    }

    const links = []

    for (const key in props.links) {
        links.push(
            <a
                target="_blank"
                rel="noopener noreferrer"
                href={props.links[key]}
                className="package-link"
                title={key}
            >
                {props.links[key]}
            </a>
        )
    }

    return (
        <div className="package-info-block">
            <span className="label">Links</span>
            <div className="links-container">
                {links.map((item, index) => (
                    <React.Fragment key={index}>{item}</React.Fragment>
                ))}
            </div>
        </div>
    )
}

const GitHubStats = props =>
    props.stars === null || props.forks === null ? null : (
        <div className="package-info-block">
            <span className="label">Statistics</span>
            <Row justify="center" align="center" className="github-stats">
                <Col span={12}>
                    <Statistic title="Stars" value={props.stars} />
                </Col>
                <Col span={12}>
                    <Statistic title="Forks" value={props.forks} />
                </Col>
            </Row>
        </div>
    )

const DownloadStats = props =>
    props.downloads === null || props.dependents === null ? null : (
        <div className="package-info-block">
            <Row justify="center" align="center">
                <Col span={12}>
                    <Statistic title="Dependents" value={props.dependents} />
                </Col>
                <Col span={12}>
                    <Statistic title="Downloads" value={props.downloads} />
                </Col>
            </Row>
        </div>
    )

const QualityStats = props =>
    props.quality === null || props.popularity === null ? null : (
        <div className="package-info-block">
            <Row justify="center" align="center" gutter={32}>
                <Col span={12}>
                    <div className="stats-score">
                        <span className="label">Quality</span>
                        <Progress
                            type="circle"
                            size="small"
                            width={100}
                            percent={props.quality}
                            format={percent => `${percent}%`}
                            className="stats-progress"
                        />
                    </div>
                </Col>
                <Col span={12}>
                    <div className="stats-score">
                        <span className="label">Popularity</span>
                        <Progress
                            type="circle"
                            size="small"
                            width={100}
                            percent={props.popularity}
                            format={percent => `${percent}%`}
                            className="stats-progress"
                        />
                    </div>
                </Col>
            </Row>
        </div>
    )

const Dependencies = props => {
    const deps = Object.keys(props.dependencies)

    return (
        <div className="package-info-block dependencies">
            <Collapse
                bordered={false}
                className="dependencies-collapse"
                expandIconPosition="right"
            >
                <Panel
                    header={`Direct Dependencies: ${deps.length}`}
                    className="dependencies-collapse-panel"
                >
                    {deps.map(packageName => (
                        <div
                            key={packageName}
                            className="dependency-info"
                            onClick={() => props.onDependencyClick(packageName)}
                        >
                            <span className="dependency-name" title={packageName}>
                                {packageName}
                            </span>
                            <span
                                className="dependency-name"
                                title={props.dependencies[packageName]}
                            >
                                {props.dependencies[packageName]}
                            </span>
                        </div>
                    ))}
                </Panel>
            </Collapse>
        </div>
    )
}

const PackageInfo = props => {
    if (props.isLoading) {
        return (
            <div className="package-info-status">
                Loading details for {props.searchQuery}...
            </div>
        )
    }

    if (props.errorCode) {
        let message = ''

        switch (props.errorCode) {
            case Errors.BAD_REQUEST:
            case Errors.NOT_FOUND:
                message = `No details found for ${props.searchQuery}`
                break
            default:
                message = `An error ocurred while loading details for ${props.searchQuery}`
        }

        return <div className="package-info-status">{message}</div>
    }

    if (!props.packageInfo) {
        return null
    }

    const {
        name,
        description,
        version,
        dependencies,
        downloads,
        dependents,
        stars,
        forks,
        quality,
        popularity,
        links
    } = props.packageInfo

    return (
        <div className="package-info">
            <div className="package-info-block">
                <span className="label">Package</span>
                <div className="dependency-info package-name">
                    <span className="dependency-name">{name}</span>
                    <span>{version}</span>
                </div>
            </div>
            {description ? (
                <div className="package-info-block">
                    <span className="label">Description</span>
                    <p className="package-description">{description}</p>
                </div>
            ) : null}
            <PackageLinks links={links} />
            <GitHubStats stars={stars} forks={forks} />
            <DownloadStats downloads={downloads} dependents={dependents} />
            <QualityStats quality={quality} popularity={popularity} />
            <Dependencies
                dependencies={dependencies}
                onDependencyClick={packageName => {
                    // Update the url to include a query string with the package name
                    // when a dependency is clicked
                    const url = `${window.location.pathname}?q=${encodeURIComponent(
                        packageName
                    )}`
                    window.history.pushState({}, '', url)
                    props.searchPackage(packageName)
                }}
            />
            <Divider className="package-info-divider" />
        </div>
    )
}

const mapStateToProps = state => ({
    isLoading: state.package.isLoading,
    packageInfo: state.package.packageInfo,
    errorCode: state.package.errorCode,
    searchQuery: state.search.searchQuery
})

const mapDispatchToProps = {
    searchPackage
}

export default connect(mapStateToProps, mapDispatchToProps)(PackageInfo)
