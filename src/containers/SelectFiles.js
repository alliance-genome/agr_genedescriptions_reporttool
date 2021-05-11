import React from 'react';
import {connect} from "react-redux";
import {Button, Col, Container, Row} from "react-bootstrap";
import {getSelectedOperation} from "../redux/selectors";
import DiffSelector from "../components/DiffSelector";
import ViewFileSelector from "../components/ViewFileSelector";
import {Link} from "react-router-dom";

const SelectFiles = (props) => {
    return (
        <Container fluid>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    {props.selectedOperation === 'diff' ?
                        <DiffSelector />
                        :
                        <ViewFileSelector />
                    }
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Link to="/mod_selection"><Button variant="outline-success">Previous</Button></Link>&nbsp;
                    <Link to="/display_results"><Button variant="outline-success">Next</Button></Link>
                </Col>
            </Row>
        </Container>
    )
}

const mapStateToProps = state => ({
  selectedOperation: getSelectedOperation(state)
});

export default connect(mapStateToProps, {})(SelectFiles)
