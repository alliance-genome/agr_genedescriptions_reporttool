import React from 'react';
import {connect} from "react-redux";
import {
    addViewSelectedDisplayField, removeViewSelectedDisplayField,
    setDiffFilterGeneName,
    setDiffFilterGeneNameCS,
    setDiffFilterGeneNameSubstr,
    setDiffFilterPhrase,
    setDiffFilterPhraseCS,
    setSelectedDiffField,
    setSelectedFileInfo,
    setViewEntriesPerPage,
    setViewFilterHasData, setViewFilterMinFinalExpGOIDCount, setViewFilterMinFinalExpGOIDOp, setViewFilterOntologyID,
    setViewPageNum
} from "../redux/actions";
import {
    getDiffFields,
    getDiffFilterGeneName,
    getDiffFilterGeneNameCS,
    getDiffFilterGeneNameSubstr,
    getDiffFilterPhrase,
    getDiffFilterPhraseCS,
    getFileNameList, getSelectedFilesInfo,
    getViewEntriesPerPage,
    getViewFilterHasData,
    getViewFilterMinFinalExpGOIDCount, getViewFilterMinFinalExpGOIDOp,
    getViewFilterOntologyID,
    getViewPageNum, getViewSelectedDisplayFields
} from "../redux/selectors";
import {Col, Container, Form, Row} from "react-bootstrap";

const ViewFileSelector = (props) => {

    return (
        <Container fluid>
            <Row>
                <Col xs="auto">
                    <h6>Select file to view</h6>
                    <Form.Control as="select" htmlSize={props.fileNameList.length} defaultValue={JSON.stringify(props.selectedFileInfo)}
                                  onChange={(event) => {
                                      props.setSelectedFileInfo(JSON.parse(event.target.value), 0);
                                      props.setSelectedFileInfo(undefined, 1)
                                  }}>
                        {props.fileNameList.map(fileObj =>
                            <option
                                value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                            </option>)}
                    </Form.Control>
                </Col>
                <Col xs="auto">
                    <h6>Which fields to display</h6>
                    {props.diffFields.map(item =>
                        <Form.Check
                            type="checkbox"
                            checked={props.viewSelectedDisplayFields[item.name]}
                            onChange={(event) => {
                                if (event.target.checked) {
                                    props.addViewSelectedDisplayField(item.name);
                                } else {
                                    props.removeViewSelectedDisplayField(item.name);
                                }
                            }}
                            label={item.label}
                        />)}
                </Col>
                <Col xs="auto">
                    <h6>Which type of results to show</h6>
                    <Form.Check
                        type="radio"
                        checked={props.viewFilterHasData}
                        onClick={(e) => props.setViewFilterHasData(true)}
                        label="Has Data"
                    />
                    <Form.Check
                        type="radio"
                        checked={!props.viewFilterHasData}
                        onClick={(e) => props.setViewFilterHasData(false)}
                        label="Does not have Data"
                    />
                </Col>
                <Col>
                    <h6>Optional gene name filter</h6>
                    <Form.Control
                        as="textarea"
                        size="100"
                        value={props.diffFilterGeneName}
                        onChange={(e) => props.setDiffFilterGeneName(e.target.value)} />
                    <Form.Check
                        type="checkbox"
                        checked={props.diffFilterGeneNameCS}
                        onChange={(e) => props.setDiffFilterGeneNameCS(e.target.checked)}
                        label="Case sensitive"
                    />
                    <Form.Check
                        type="checkbox"
                        checked={props.diffFilterGeneNameSubstr}
                        onChange={(e) => props.setDiffFilterGeneNameSubstr(e.target.value)}
                        label="Substring Match"
                    />
                    <br/>
                    <h6>Optional phrase filter</h6>
                    <Form.Control
                        as="textarea"
                        size="100"
                        value={props.diffFilterPhrase}
                        onChange={(e) => props.setDiffFilterPhrase(e.target.value)} />
                    <Form.Check
                        type="checkbox"
                        checked={props.diffFilterPhraseCS}
                        onChange={(e) => props.setDiffFilterPhraseCS(e.target.checked)}
                        label="Case sensitive"
                    />
                    <br/>
                    <h6>Optional ontology ID filter</h6>
                    <Form.Control
                        as="textarea"
                        type="text"
                        size="100"
                        value={props.viewFilterOntologyID}
                        onChange={(e) => props.setViewFilterOntologyID(e.target.value)} />
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row>
                <Col xs="auto">
                    <h6>Count of set_final_experimental_go_ids</h6>
                    <Form>
                        <Row>
                            <Col xs={4}>
                                <Form.Control as="select" inline name="loadComparisonGoids" id="loadComparisonGoids" value={props.viewFilterMinFinalExpGOIDOp}
                                              onChange={(e) => props.setViewFilterMinFinalExpGOIDOp(e.target.value)}>
                                    <option value=">=">&gt;=</option>
                                    <option value="<=">&lt;=</option>
                                    <option value="==">==</option>
                                </Form.Control>
                            </Col>
                            <Col xs={8}>
                                <Form.Control
                                    inline
                                    type="number"
                                    size="5"
                                    value={props.viewFilterMinFinalExpGOIDCount}
                                    onChange={(e) => props.setViewFilterMinFinalExpGOIDCount(e.target.value)} />
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row>
                <Col xs="auto">
                    <h6>Entries per page</h6>
                    <Form.Control
                        type="number"
                        size="5"
                        value={props.viewEntriesPerPage}
                        onChange={(e) => props.setViewEntriesPerPage(e.target.value)} />
                </Col>
                <Col xs="auto">
                    <h6>Page number</h6>
                    <Form.Control
                        type="number"
                        size="5"
                        value={props.viewPageNum}
                        onChange={(e) => props.setViewPageNum(e.target.value)} />
                </Col>
            </Row>
        </Container>
    );
}

const mapStateToProps = state => ({
    diffFields: getDiffFields(state),
    fileNameList: getFileNameList(state),
    viewFilterHasData: getViewFilterHasData(state),
    viewEntriesPerPage: getViewEntriesPerPage(state),
    viewPageNum: getViewPageNum(state),
    viewFilterOntologyID: getViewFilterOntologyID(state),
    viewFilterMinFinalExpGOIDOp: getViewFilterMinFinalExpGOIDOp(state),
    viewFilterMinFinalExpGOIDCount: getViewFilterMinFinalExpGOIDCount(state),
    diffFilterGeneName: getDiffFilterGeneName(state),
    diffFilterGeneNameCS: getDiffFilterGeneNameCS(state),
    diffFilterGeneNameSubstr: getDiffFilterGeneNameSubstr(state),
    diffFilterPhrase: getDiffFilterPhrase(state),
    diffFilterPhraseCS: getDiffFilterPhraseCS(state),
    selectedFileInfo: getSelectedFilesInfo(state)[0],
    viewSelectedDisplayFields: getViewSelectedDisplayFields(state)
});

export default connect(mapStateToProps, {setSelectedDiffField, setSelectedFileInfo, setViewFilterHasData,
    setViewEntriesPerPage, setViewPageNum, setDiffFilterGeneName, setDiffFilterGeneNameCS, setDiffFilterGeneNameSubstr,
    setDiffFilterPhrase, setDiffFilterPhraseCS, setViewFilterOntologyID, setViewFilterMinFinalExpGOIDOp,
    setViewFilterMinFinalExpGOIDCount, addViewSelectedDisplayField, removeViewSelectedDisplayField})(ViewFileSelector);