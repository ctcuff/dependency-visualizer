import './package-info.scss'
import React from 'react'
import { Row, Col, Progress, Statistic, Collapse } from 'antd'
import { connect } from 'react-redux'

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
    !props.stars || !props.forks ? null : (
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
    !props.downloads || !props.dependents ? null : (
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
    !props.quality || !props.popularity ? null : (
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
        <div className="package-info-block">
            <Collapse
                bordered={false}
                className="dependencies-collapse"
                expandIconPosition="right"
            >
                <Panel
                    header={`Direct Dependencies: ${deps.length}`}
                    className="dependencies-collapse-panel"
                >
                    {deps.map(key => (
                        <div
                            key={key}
                            className="dependency-info"
                            onClick={() => props.onDependencyClick(key)}
                        >
                            <span className="dependency-name">{key}</span>
                            <span>{props.dependencies[key]}</span>
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
            // 400 occurs when a user searches for a package
            // with invalid characters
            case 400:
            case 404:
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
                onDependencyClick={props.onDependencyClick}
            />
        </div>
    )
}

const mapStateToProps = state => ({
    isLoading: state.package.isLoading,
    packageInfo: state.package.packageInfo,
    errorCode: state.package.errorCode,
    searchQuery: state.search.searchQuery
})

export default connect(mapStateToProps)(PackageInfo)
