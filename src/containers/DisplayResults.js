import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Button, Col, Container, Row} from "react-bootstrap";
import {getSelectedFilesInfo, getSelectedOperation} from "../redux/selectors";
import {Link, useLocation} from "react-router-dom";
import DiffViewer from "../components/DiffViewer";
import ViewFileViewer from "../components/ViewFileViewer";
import DownloadFileViewer from "../components/DownloadFileViewer";

const DisplayResults = (props) => {

    const location = useLocation();

    useEffect(() => {

    }, [props.selectedFilesInfo]);

    return (
        <Container fluid>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    {props.selectedOperation === 'diff' ? <DiffViewer/> : null}
                    {props.selectedOperation === 'download' ? <DownloadFileViewer/> : null}
                    {props.selectedOperation === 'view' ? <ViewFileViewer/> : null}
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Link to={{ pathname: "/file_selection", search: location.search}}><Button variant="outline-success">Previous</Button></Link>&nbsp;
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
