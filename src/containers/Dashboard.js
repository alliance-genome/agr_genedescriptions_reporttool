import React from 'react';
import ModSelector from "../components/ModSelector";
import {Button, Col, Container, Row} from "react-bootstrap";
import QuickDiff from "../components/QuickDiff";
import {Link, useLocation} from "react-router-dom";

const Dashboard = ({}) => {

    const location = useLocation();

    return (
        <Container>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <h3>Dashboard</h3>
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <ModSelector/>
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <h5>Difference between previous release file and latest available file</h5>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <QuickDiff />
                    Only release/stage files are included in this quick view
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    Click on 'More options' to view, download, or diff file content
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-md-center">
                <Col xs="auto">
                    <Link to={{ pathname: "/mod_selection", search: location.search}}><Button variant="outline-success">More options</Button></Link>
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row><Col>&nbsp;</Col></Row>
        </Container>
    );
}

export default Dashboard;