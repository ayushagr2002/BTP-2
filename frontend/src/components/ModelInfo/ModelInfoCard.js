import React, { useState, useRef, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea, CardActions, CircularProgress, Typography } from '@mui/material';
import { Row, Col, Button } from 'reactstrap';
import UpdateIcon from '@mui/icons-material/Update';
import InfoIcon from '@mui/icons-material/Info';
import PublishIcon from '@mui/icons-material/Publish';
import Modal from '@mui/material/Modal';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Table as ReactStrapTable, Collapse } from "reactstrap";
import axios from "axios";
import { Button as MuiButton } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "50%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


const ModelCard = (props) => {
    const modelDetails = props.modelDetails;
    const dataset_map = props.dataset_map;
    const [value, setValue] = React.useState(0);
    const [showAllVersions, setShowAllVersions] = React.useState(false);
    const [selectedVersion, setSelectedVersion] = React.useState(1);
    const [deployLoading, setDeployLoading] = React.useState(false);
    const [modelDeployed, setModelDeployed] = React.useState(false);
    const [deployedModel, setDeployedModel] = React.useState();
    const [metricNames, setMetricNames] = React.useState([]);
    const [bestVersion, setBestVersion] = React.useState(1);
    const [bestMetric, setBestMetric] = React.useState(modelDetails.metric_type);
    const [bestVersionSelected, setBestVersionSelected] = React.useState(false);
    const [deployModalOpen, setDeployModalOpen] = useState(false);
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadedModel, setDownloadedModel] = useState();

    useEffect(() => {
        setMetricNames(getMetricNames());
    }, []);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };



    function getMetricValue(metric_arr, metric_type) {
        for (var i = 0; i < metric_arr.length; i++) {
            if (metric_arr[i].metric_name === metric_type) {
                return metric_arr[i].metric_value;
            }
        }
    }

    function getDateFromTimestamp(timestamp) {
        console.log(timestamp.$date)
        // get local timestamp
        var utc = new Date(timestamp.$date);
        var date = new Date(utc.getTime() + utc.getTimezoneOffset() * 60 * 1000);
        var dateString = date.toLocaleDateString();
        return dateString;
    }

    function getTimeIn12Hours(timestamp) {
        var utc = new Date(timestamp.$date);
        var date = new Date(utc.getTime() + utc.getTimezoneOffset() * 60 * 1000);
        // get timestring in 12 hours format (get only hours and minutes)
        var timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return timeString;
    }

    const onClickDeploy = () => {
        setDeployModalOpen(true);
    }

    const DownloadModel = () => {
        setDownloadLoading(true);
        setDownloadedModel(false);
        axios.get("http://127.0.0.1:5000/getTrainedModelFile/" + modelDetails.model_id + "/" + selectedVersion)
            .then((response) => {
                console.log(response);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', modelDetails.model_name + "_" + selectedVersion + '.pkl');
                document.body.appendChild(link);
                link.click();
                setDownloadLoading(false);
                setDownloadedModel(true);
            }
            ).catch((error) => {
                console.log(error);
            });
    }

    const DeployModel = async () => {
        setDeployLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:5000/deploy", {
                "model_id": modelDetails.model_id,
                "version_number": selectedVersion,
            });
            console.log(response);
            setDeployedModel(modelDetails.model_id);
            setModelDeployed(true);
        } catch (error) {
            console.log(error);
        }
        setDeployLoading(false);
    }

    const getMetricNames = () => {
        var metric_names = [];
        for (var i = 0; i < modelDetails.evaluation_metrics.length; i++) {
            if (modelDetails.evaluation_metrics[i].metric_name != 'classifier')
                metric_names.push(modelDetails.evaluation_metrics[i].metric_name);
        }
        return metric_names;
    }

    const selectBestVersion = (metric_type) => {
        var best_value = 0;
        var best_version = 0;
        for (var i = 0; i < modelDetails.versions.length; i++) {
            if (modelDetails.versions[i].evaluation_metrics[metric_type] > best_value) {
                best_version = modelDetails.versions[i].version_number;
                best_value = modelDetails.versions[i].evaluation_metrics[metric_type];
            }
        }
        return best_version + 1;
    }

    return (
        <>
            <Card>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div" style={{ textAlign: "center", marginBottom: '1rem' }}>
                        {modelDetails.model_name}
                    </Typography>
                    <Typography>
                        <Row style={{ marginBottom: '1rem' }}>
                            <Col md="6">Estimator Type:</Col>
                            <Col md="6" style={{ textAlign: "right" }}>{modelDetails.estimator_type}</Col>
                        </Row>
                        {/* <Row style={{ marginBottom: '1rem' }}>
                                <Col md="6">Objective:</Col>
                                <Col md="6" style={{ textAlign: "right" }}>{modelDetails.objective}</Col>
                            </Row> */}
                        <Row style={{ marginBottom: '1rem' }}>
                            <Col md="6">Metric:</Col>
                            <Col md="6" style={{ textAlign: "right" }}>{modelDetails.metric_type}</Col>
                        </Row>
                        <Row style={{ marginBottom: '1rem' }}>
                            <Col md="6" style={{ fontWeight: "bold" }}>Metric Score:</Col>
                            <Col md="6" style={{ textAlign: "right", fontWeight: "bold" }}>{getMetricValue(modelDetails.evaluation_metrics, modelDetails.metric_type)}</Col>
                        </Row>
                        <Row style={{ marginBottom: '1rem' }}>
                            <Col md="6">Training Mode:</Col>
                            <Col md="6" style={{ textAlign: "right" }}>{modelDetails.training_mode}</Col>
                        </Row>
                        <Row style={{ marginBottom: '1rem' }}>
                            <Col md="6">Created:</Col>
                            <Col md="6" style={{ textAlign: "right" }}>{getDateFromTimestamp(modelDetails.time)}, {getTimeIn12Hours(modelDetails.time)}</Col>
                        </Row>
                        <Row style={{ marginBottom: '1rem' }}>
                            <Col md="4">Dataset:</Col>
                            <Col md="8" style={{ textAlign: "right" }}>{dataset_map[modelDetails.dataset_id]} (ID:{(modelDetails.dataset_id)})</Col>
                        </Row>
                        <Row style={{ marginBottom: '1rem' }}>
                            <Col md="6">Versions Available:</Col>
                            <Col md="6" style={{ textAlign: "right" }}>{modelDetails.versions.length}</Col>
                        </Row>
                        <Row >
                            <Col md="12" style={{ textAlign: "center" }}>
                                <MuiButton onClick={() => { setDownloadModalOpen(true) }}>Download Model</MuiButton>
                            </Col>
                        </Row>
                    </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'space-between' }}>
                    <Button size="small" color="info" onClick={() => { window.location.href = "/models/" + modelDetails.model_id }}>
                        <InfoIcon />
                        View Details
                    </Button>
                    <Button
                        size="small"
                        style={{ backgroundColor: '#ffab05', color: 'black' }}
                        onClick={() => { window.location.href = "/update/model/" + modelDetails.model_id }}
                    >
                        <UpdateIcon />   Update
                    </Button>
                    <Button size="small"
                        style={{ backgroundColor: '#80c55d', color: 'black' }}
                        onClick={() => { onClickDeploy() }}>
                        <PublishIcon /> Deploy
                    </Button>
                </CardActions>
            </Card>
            <Modal open={downloadModalOpen} onClose={() => setDownloadModalOpen(false)}>
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h5"
                        style={{ textAlign: "center", marginBottom: '1.5rem' }}
                    >
                        Download Model
                    </Typography>
                    <Typography
                        variant="h6"
                        // bold
                        style={{ textAlign: "center", marginBottom: '1.5rem' }}
                    >
                        {modelDetails.model_name} (ID: {modelDetails.model_id})
                    </Typography>
                    <Typography>
                        <Row className="align-items-center mb-3">
                            <Col md="5">
                                <Row className="align-items-center mb-3">
                                    <Col md="6">
                                        Select Version:
                                    </Col>
                                    <Col md="6">
                                        <select
                                            className="form-control"
                                            value={selectedVersion}
                                            onChange={(e) => { setSelectedVersion(e.target.value); setBestVersionSelected(false); }}
                                        >
                                            {modelDetails.versions.map((version, index) => {
                                                return (
                                                    <option value={version.version_number}>{version.version_number}</option>
                                                );
                                            })}
                                        </select>
                                    </Col>
                                </Row>
                                <Row className="align-items-center mb-3">
                                    <Col md="12">
                                        <Typography variant="subtitle1" style={{ textAlign: "center" }}>
                                            OR
                                        </Typography>
                                    </Col>
                                </Row>
                                <Row className="align-items-center mb-3">
                                    <Col md="6">
                                        Select Model which has best:
                                    </Col>
                                    <Col md="6">
                                        <select
                                            className="form-control"
                                            value={bestMetric}
                                            onChange={(e) => { setBestMetric(e.target.value); }}
                                        >
                                            {metricNames.map((metric, index) => {
                                                return (
                                                    <option value={metric}>{metric}</option>
                                                );
                                            })}
                                        </select>
                                    </Col>
                                </Row>
                                {
                                    bestVersionSelected ?
                                        <Row className="align-items-center mb-3">
                                            <Col md="12">
                                                <Typography variant="body1" style={{ textAlign: "center", color: "green" }}>
                                                    Version {bestVersion} has best {bestMetric} score of {getMetricValue(modelDetails.versions[bestVersion - 1].evaluation_metrics, bestMetric)} and has been selected.
                                                </Typography>
                                            </Col>
                                        </Row>
                                        : null
                                }
                                <Row className="align-items-center mb-3">
                                    <Button color="info" onClick={() => { setSelectedVersion(selectBestVersion(modelDetails.metric_type)); setBestVersionSelected(true) }}>Select Best Version</Button>
                                </Row>
                            </Col>

                            <Col md="7">
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={value} onChange={handleChange}>
                                        <Tab label="Metrics" {...a11yProps(0)} />
                                        <Tab label="Parameters" {...a11yProps(1)} />
                                    </Tabs>
                                </Box>
                                <CustomTabPanel value={value} index={0}>
                                    <ReactStrapTable striped>
                                        <thead>
                                            <tr>
                                                <th>Metric</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modelDetails.versions[selectedVersion - 1].evaluation_metrics.map((metric, index) => {

                                                if (metric.metric_name != 'classifier') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{metric.metric_name}</td>
                                                            <td>{metric.metric_value}</td>
                                                        </tr>)
                                                }
                                                else {
                                                    return null;
                                                }
                                                ;
                                            })}
                                        </tbody>
                                    </ReactStrapTable>
                                </CustomTabPanel>
                                <CustomTabPanel value={value} index={1}>
                                    <ReactStrapTable striped>
                                        <thead>
                                            <tr>
                                                <th>Parameter</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modelDetails.versions[selectedVersion - 1].parameters.map((parameter, index) => {
                                                return (
                                                    <tr hover size='small' key={index}>
                                                        <td>{parameter.parameter_name}</td>
                                                        <td>{parameter.parameter_value}</td>
                                                    </tr>
                                                );
                                            }
                                            )}
                                        </tbody>
                                    </ReactStrapTable>
                                </CustomTabPanel>
                            </Col>
                        </Row>
                        {downloadLoading ?
                            <Row style={{ marginBottom: '1.5rem' }}>
                                <Col md="12" style={{ textAlign: "center" }}>
                                    <Typography variant="body1" style={{ textAlign: "center", justifyContent: 'center', alignItems: 'center' }}>
                                        <CircularProgress /> Downloading Model, Please wait...
                                    </Typography>
                                </Col>
                            </Row> : null
                        }
                        {
                            downloadedModel ? 
                            <Row style={{ marginBottom: '1.5rem' }}>
                                <Col md="12" style={{ textAlign: "center" }}>
                                    <Typography variant="body1" style={{ textAlign: "center", color: "green" }}>
                                       <CheckCircleOutline color='success'/>  Model Downloaded Successfully!
                                    </Typography>
                                </Col>
                            </Row> : null
                        }
                        <Row>
                            <Col md="6" style={{ textAlign: "center" }}>
                                <Button size="large" color="info" onClick={() => setDownloadModalOpen(false)}>Cancel</Button>
                            </Col>
                            <Col md="6" style={{ textAlign: "center" }}>
                                <Button size="large" color="success" disabled={downloadLoading} onClick={() => { DownloadModel() }}>Download</Button>
                            </Col>
                        </Row>
                    </Typography>
                </Box>
            </Modal>
            <Modal open={deployModalOpen} onClose={() => setDeployModalOpen(false)}>
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h5"
                        style={{ textAlign: "center", marginBottom: '1.5rem' }}
                    >
                        Model Deployment
                    </Typography>
                    <Typography
                        variant="h6"
                        // bold
                        style={{ textAlign: "center", marginBottom: '1.5rem' }}
                    >
                        {modelDetails.model_name} (ID: {modelDetails.model_id})
                    </Typography>
                    <Typography>
                        <Row className="align-items-center mb-3">
                            <Col md="5">
                                <Row className="align-items-center mb-3">
                                    <Col md="6">
                                        Select Version:
                                    </Col>
                                    <Col md="6">
                                        <select
                                            className="form-control"
                                            value={selectedVersion}
                                            onChange={(e) => { setSelectedVersion(e.target.value); setBestVersionSelected(false); }}
                                        >
                                            {modelDetails.versions.map((version, index) => {
                                                return (
                                                    <option value={version.version_number}>{version.version_number}</option>
                                                );
                                            })}
                                        </select>
                                    </Col>
                                </Row>
                                <Row className="align-items-center mb-3">
                                    <Col md="12">
                                        <Typography variant="subtitle1" style={{ textAlign: "center" }}>
                                            OR
                                        </Typography>
                                    </Col>
                                </Row>
                                <Row className="align-items-center mb-3">
                                    <Col md="6">
                                        Select Model which has best:
                                    </Col>
                                    <Col md="6">
                                        <select
                                            className="form-control"
                                            value={bestMetric}
                                            onChange={(e) => { setBestMetric(e.target.value); }}
                                        >
                                            {metricNames.map((metric, index) => {
                                                return (
                                                    <option value={metric}>{metric}</option>
                                                );
                                            })}
                                        </select>
                                    </Col>
                                </Row>
                                {
                                    bestVersionSelected ?
                                        <Row className="align-items-center mb-3">
                                            <Col md="12">
                                                <Typography variant="body1" style={{ textAlign: "center", color: "green" }}>
                                                    Version {bestVersion} has best {bestMetric} score of {getMetricValue(modelDetails.versions[bestVersion - 1].evaluation_metrics, bestMetric)} and has been selected.
                                                </Typography>
                                            </Col>
                                        </Row>
                                        : null
                                }
                                <Row className="align-items-center mb-3">
                                    <Button color="info" onClick={() => { setSelectedVersion(selectBestVersion(modelDetails.metric_type)); setBestVersionSelected(true) }}>Select Best Version</Button>
                                </Row>
                            </Col>

                            <Col md="7">
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={value} onChange={handleChange}>
                                        <Tab label="Metrics" {...a11yProps(0)} />
                                        <Tab label="Parameters" {...a11yProps(1)} />
                                    </Tabs>
                                </Box>
                                <CustomTabPanel value={value} index={0}>
                                    <ReactStrapTable striped>
                                        <thead>
                                            <tr>
                                                <th>Metric</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modelDetails.versions[selectedVersion - 1].evaluation_metrics.map((metric, index) => {

                                                if (metric.metric_name != 'classifier') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{metric.metric_name}</td>
                                                            <td>{metric.metric_value}</td>
                                                        </tr>)
                                                }
                                                else {
                                                    return null;
                                                }
                                                ;
                                            })}
                                        </tbody>
                                    </ReactStrapTable>
                                </CustomTabPanel>
                                <CustomTabPanel value={value} index={1}>
                                    <ReactStrapTable striped>
                                        <thead>
                                            <tr>
                                                <th>Parameter</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modelDetails.versions[selectedVersion - 1].parameters.map((parameter, index) => {
                                                return (
                                                    <tr hover size='small' key={index}>
                                                        <td>{parameter.parameter_name}</td>
                                                        <td>{parameter.parameter_value}</td>
                                                    </tr>
                                                );
                                            }
                                            )}
                                        </tbody>
                                    </ReactStrapTable>
                                </CustomTabPanel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="6" style={{ textAlign: "center" }}>
                                <Button size="large" color="info" onClick={() => setDeployModalOpen(false)}>Cancel</Button>
                            </Col>
                            <Col md="6" style={{ textAlign: "center" }}>
                                <Button size="large" color="success">Deploy</Button>
                            </Col>
                        </Row>
                    </Typography>
                </Box>
            </Modal >
        </>
    )
}

export default ModelCard;