import './package-info.scss'
import React from 'react'
import { Row, Col, Progress, Statistic } from 'antd'

const PackageInfo = props => {
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
        popularity
    } = props.packageInfo

    const deps = Object.keys(dependencies)

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
            {stars && forks ? (
                <div className="package-info-block">
                    <span className="label">Statistics</span>
                    <Row justify="center" align="center" className="github-stats">
                        <Col span={12}>
                            <Statistic title="Stars" value={stars} />
                        </Col>
                        <Col span={12}>
                            <Statistic title="Forks" value={forks} />
                        </Col>
                    </Row>
                </div>
            ) : null}
            <div className="package-info-block">
                <Row justify="center" align="center">
                    <Col span={12}>
                        <Statistic title="Dependents" value={dependents} />
                    </Col>
                    <Col span={12}>
                        <Statistic title="Downloads" value={downloads} />
                    </Col>
                </Row>
            </div>
            <div className="package-info-block">
                <Row justify="center" align="center" gutter={32}>
                    <Col span={12}>
                        <div className="stats-score">
                            <span className="label">Quality</span>
                            <Progress
                                type="circle"
                                size="small"
                                percent={quality}
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
                                percent={popularity}
                                format={percent => `${percent}%`}
                                className="stats-progress"
                            />
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="package-info-block">
                <span className="label">Direct Dependencies: {deps.length}</span>
                <div className="dependencies">
                    {deps.map(key => (
                        <div
                            key={key}
                            className="dependency-info"
                            onClick={() => props.onDependencyClick(key)}
                        >
                            <span className="dependency-name">{key}</span>
                            <span>{dependencies[key]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PackageInfo
