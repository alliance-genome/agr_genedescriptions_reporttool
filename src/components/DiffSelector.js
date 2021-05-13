import React from 'react';
import {connect} from "react-redux";
import {Col, Container, Form, FormControl, Row, Spinner} from "react-bootstrap";
import {
    getDiffFields,
    getDiffFilterGeneName,
    getDiffFilterGeneNameCS,
    getDiffFilterGeneNameSubstr,
    getDiffFilterPhrase,
    getDiffFilterPhraseCS, getFileNameList,
    getSelectedDiffField, getSelectedFilesInfo
} from "../redux/selectors";
import {
    setDiffFilterGeneName, setDiffFilterGeneNameCS, setDiffFilterGeneNameSubstr,
    setDiffFilterPhrase,
    setDiffFilterPhraseCS,
    setSelectedDiffField, setSelectedFileInfo,
} from "../redux/actions";

const DiffSelector = (props) => {

    return (
        <Container fluid>
            {props.fileNameList.length > 0 ?
                <>
                    <Row className="justify-content-center">
                        <Col xs="auto">
                            <h6>Select old file</h6>
                            <FormControl as="select" htmlSize={props.fileNameList.length}
                                         value={props.selectedFilesInfo[0] !== undefined ? JSON.stringify(props.selectedFilesInfo[0]) : null}
                                         onChange={(event) => props.setSelectedFileInfo(JSON.parse(event.target.value), 0)}>
                                {props.fileNameList.map(fileObj =>
                                    <option
                                        key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                                        value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                                    </option>)}
                            </FormControl>
                        </Col>
                        <Col xs="auto">
                            <h6>Select new file</h6>
                            <FormControl as="select" htmlSize={props.fileNameList.length}
                                         value={props.selectedFilesInfo[1] !== undefined ? JSON.stringify(props.selectedFilesInfo[1]) : null}
                                         onChange={(event) => props.setSelectedFileInfo(JSON.parse(event.target.value), 1)}>
                                {props.fileNameList.map(fileObj =>
                                    <option
                                        key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                                        value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                                    </option>)}
                            </FormControl>
                        </Col>
                        <Col xs="auto">
                            <h6>Select field to compare</h6>
                            <FormControl as="select" htmlSize={props.diffFields.length}
                                         value={props.selectedDiffField}
                                         onChange={(e) => props.setSelectedDiffField(e.target.value)}>
                                {props.diffFields.map((diffField) => <option key={diffField.name}
                                                                             value={diffField.name}>{diffField.label}</option>)}
                            </FormControl>
                        </Col>
                    </Row>
                    <Row><Col>&nbsp;</Col></Row>
                    <Row className="justify-content-center">
                        <Col xs="auto">
                            <Form.Label>Optional gene name filter:</Form.Label>
                            <Form.Control as="textarea"
                                          name="diffGeneNameFilter"
                                          id="diffGeneNameFilter"
                                          type="text"
                                          size="100"
                                          value={props.diffFilterGeneName}
                                          onChange={(e) => props.setDiffFilterGeneName(e.target.value)}/><br/>
                            <Form.Check
                                name="checkboxDiffGeneNameFilter"
                                type="checkbox"
                                checked={props.diffFilterGeneNameCS}
                                onChange={(e) => props.setDiffFilterGeneNameCS(e.target.checked)}
                                label="Case sensitive"
                            />
                            <Form.Check
                                name="checkboxDiffGeneNameSubstring"
                                type="checkbox"
                                checked={props.diffFilterGeneNameSubstr}
                                onChange={(e) => props.setDiffFilterGeneNameSubstr(e.target.checked)}
                                label="Substring match"
                            />
                        </Col>
                        <Col xs="auto">
                            <Form.Label>Optional phrase filter:</Form.Label>
                            <Form.Control as="textarea"
                                          name="diffKeywordFilter"
                                          id="diffKeywordFilter"
                                          type="text"
                                          size="100"
                                          value={props.diffFilterPhrase}
                                          onChange={(e) => props.setDiffFilterPhrase(e.target.value)}/><br/>
                            <Form.Check
                                name="checkboxDiffKeywordFilter"
                                type="checkbox"
                                checked={props.diffFilterPhraseCS}
                                onChange={(e) => props.setDiffFilterPhraseCS(e.target.value)} label="Case sensitive"/>
                        </Col>
                    </Row>
                </> : <Spinner animation="grow"/>}
        </Container>
    );
}

const mapStateToProps = state => ({
    diffFields: getDiffFields(state),
    selectedDiffField: getSelectedDiffField(state),
    selectedFilesInfo: getSelectedFilesInfo(state),
    fileNameList: getFileNameList(state),
    diffFilterGeneName: getDiffFilterGeneName(state),
    diffFilterGeneNameCS: getDiffFilterGeneNameCS(state),
    diffFilterGeneNameSubstr: getDiffFilterGeneNameSubstr(state),
    diffFilterPhrase: getDiffFilterPhrase(state),
    diffFilterPhraseCS: getDiffFilterPhraseCS(state)
});

export default connect(mapStateToProps, {setSelectedDiffField, setSelectedFileInfo, setDiffFilterGeneName,
    setDiffFilterGeneNameCS, setDiffFilterGeneNameSubstr, setDiffFilterPhrase, setDiffFilterPhraseCS})(DiffSelector);