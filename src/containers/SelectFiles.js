import React from 'react';
import {connect} from "react-redux";
import {Button, Col, Container, Row} from "react-bootstrap";
import {getSelectedOperation} from "../redux/selectors";
import DiffSelector from "../components/DiffSelector";
import ViewFileSelector from "../components/ViewFileSelector";
import {Link, useLocation} from "react-router-dom";
import DownloadFileSelector from "../components/DownloadFileSelector";

const SelectFiles = (props) => {

    const location = useLocation();

    return (
        <Container fluid>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    {props.selectedOperation === 'diff' ? <DiffSelector /> : null}
                    {props.selectedOperation === 'download' ? <DownloadFileSelector /> : null}
                    {props.selectedOperation === 'view' ? <ViewFileSelector /> : null}
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Link to={{ pathname: "/mod_selection", search: location.search}}><Button variant="outline-success">Previous</Button></Link>&nbsp;
                    <Link to={{ pathname: "/display_results", search: location.search}}><Button variant="outline-success">Next</Button></Link>
                </Col>
            </Row>
        </Container>
    )
}

const mapStateToProps = state => ({
  selectedOperation: getSelectedOperation(state)
});

export default connect(mapStateToProps, {})(SelectFiles)
