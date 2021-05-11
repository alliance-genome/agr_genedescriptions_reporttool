import React from 'react';
import {Col, Container, FormCheck, Row} from "react-bootstrap";
import {connect} from "react-redux";
import {getLatestFilesOnly} from "../redux/selectors";
import {setLatestFilesOnly} from "../redux/actions";

const FileTypeSelector = (props) => {

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <FormCheck inline type="radio" name="releaseLatest"
                               onChange={() => props.setLatestFilesOnly(true)}
                               checked={props.latestFilesOnly}
                               label='Latest file for a given version and release type'
                    />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <FormCheck inline type="radio" name="releaseLatest"
                               onChange={() => props.setLatestFilesOnly(false)}
                               checked={!props.latestFilesOnly}
                               label='All Files'
                    />
                </Col>
            </Row>
        </Container>
    )
}

const mapStateToProps = state => ({
  latestFilesOnly: getLatestFilesOnly(state)
});

export default connect(mapStateToProps, {setLatestFilesOnly})(FileTypeSelector)