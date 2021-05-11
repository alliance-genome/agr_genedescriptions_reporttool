import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Button, Col, Container, Row} from "react-bootstrap";
import {getSelectedFilesInfo, getSelectedOperation} from "../redux/selectors";
import DiffSelector from "../components/DiffSelector";
import ViewFileSelector from "../components/ViewFileSelector";
import {Link} from "react-router-dom";
import DiffViewer from "../components/DiffViewer";
import DownloadFile from "../components/DownloadFile";
import ViewFileViewer from "../components/ViewFileViewer";

const DisplayResults = (props) => {

    useEffect(() => {

    }, [props.selectedFilesInfo]);

    return (
        <Container fluid>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    {props.selectedOperation === 'diff' ? <DiffViewer/> : null}
                    {props.selectedOperation === 'download' ? <DownloadFile/> : null}
                    {props.selectedOperation === 'view' ? <ViewFileViewer/> : null}
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Link to="/file_selection"><Button variant="outline-success">Previous</Button></Link>&nbsp;
                </Col>
            </Row>
        </Container>
    )
}

const mapStateToProps = state => ({
    selectedOperation: getSelectedOperation(state),
    selectedFilesInfo: getSelectedFilesInfo(state)
});

export default connect(mapStateToProps, {})(DisplayResults)
