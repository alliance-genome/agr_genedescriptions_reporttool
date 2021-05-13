import React from 'react';
import ModSelector from "../components/ModSelector";
import FileTypeSelector from "../components/FileTypeSelector";
import OperationSelector from "../components/OperationSelector";
import {Button, Col, Container, Row} from "react-bootstrap";
import {Link, useLocation} from "react-router-dom";

const SelectModAndOperation = () => {

    const location = useLocation();

    return (
        <>
            <Container>
                <Row><Col>&nbsp;</Col></Row>
                <Row><Col>&nbsp;</Col></Row>
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <ModSelector/>
                    </Col>
                </Row>
                <Row><Col>&nbsp;</Col></Row>
                <Row className="justify-content-md-center">
                    <Col xs="auto">
                        <FileTypeSelector />
                    </Col>
                </Row>
                <Row><Col>&nbsp;</Col></Row>
                <Row className="justify-content-md-center">
                    <Col xs="auto">
                        <OperationSelector />
                    </Col>
                </Row>
                <Row><Col>&nbsp;</Col></Row>
                <Row><Col>&nbsp;</Col></Row>
                <Row><Col>&nbsp;</Col></Row>
                <Row className="justify-content-md-center">
                    <Col xs="auto">
                        <Link to={{ pathname: "/file_selection", search: location.search}}><Button variant="outline-success">Next</Button></Link>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default SelectModAndOperation;