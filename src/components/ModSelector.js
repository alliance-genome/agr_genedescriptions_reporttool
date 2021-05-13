import React from 'react';
import {connect} from "react-redux";
import {getModsList, getSelectedMod} from "../redux/selectors";
import {setSelectedMod} from "../redux/actions";
import {Col, Container, Form, Row} from "react-bootstrap";

const ModSelector = (props) => {

    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Form.Control as="select" htmlSize={props.modsList.length} value={props.selectedMod}
                            onChange={(event) => props.setSelectedMod(event.target.value)}>
                        {[...props.modsList].map(mod => <option key={mod} value={mod}>{mod}</option>)}
                    </Form.Control>
                </Col>
            </Row>
        </Container>
    )
}

const mapStateToProps = state => ({
    modsList: getModsList(state),
    selectedMod: getSelectedMod(state)
});

export default connect(mapStateToProps, {setSelectedMod})(ModSelector);