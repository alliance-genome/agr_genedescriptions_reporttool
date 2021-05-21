import React from 'react';
import {connect} from "react-redux";
import {getModsList, getSelectedMod} from "../redux/selectors";
import {setSelectedMod} from "../redux/actions";
import {Col, Container, Form, Row, Spinner} from "react-bootstrap";

const ModSelector = ({modsList, selectedMod, setSelectedMod}) => {

    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs="auto">
                    {modsList.length > 0 ?
                        <Form.Control as="select" htmlSize={modsList.length} value={selectedMod}
                                      onChange={(event) => setSelectedMod(event.target.value)}>
                            {[...modsList].map(mod => <option key={mod} value={mod}>{mod}</option>)}
                        </Form.Control>
                    : <Spinner animation="grow" />}
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