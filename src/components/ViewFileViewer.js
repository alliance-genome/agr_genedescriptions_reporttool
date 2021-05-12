import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {
    areFilesContentCurrent,
    getDiffFields,
    getDiffFilterGeneName,
    getDiffFilterGeneNameCS,
    getDiffFilterGeneNameSubstr,
    getDiffFilterPhrase,
    getDiffFilterPhraseCS,
    getFilesContent, getSelectedFilesInfo,
    getSelectedMod,
    getViewEntriesPerPage,
    getViewFilterHasData,
    getViewFilterMinFinalExpGOIDCount,
    getViewFilterMinFinalExpGOIDOp,
    getViewFilterOntologyID,
    getViewPageNum, getViewSelectedDisplayFields
} from "../redux/selectors";
import {Col, Container, Row, Spinner} from "react-bootstrap";
import {fetchFileContent, setViewPageNum} from "../redux/actions";

const ViewFileViewer = (props) => {

    const [rowsTableLoad, setRowsTableLoad] = useState([]);
    const [rowsTableLoadStats, setRowsTableLoadStats] = useState([]);
    const [loadFieldsMatchCount, setLoadFieldsMatchCount] = useState({});
    const [showLabelFieldsMatchCount, setShowLabelFieldsMatchCount] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showError, setShowError] = useState(false);

    const handleSubmitLoadNextPage = () => {
        let nextPage = props.viewPageNum + 1;
        props.setViewPageNum(nextPage);
    }

    const handleSubmitLoadPrevPage = () => {
        let prevPage = props.viewPageNum - 1;
        if (prevPage < 1) { prevPage = 1; }
        props.setViewPageNum(prevPage);
    }

    useEffect(() => {
        if (props.selectedFilesInfo[0] !== undefined && !props.areFilesContentCurrent) {
            props.fetchFileContent(props.selectedFilesInfo[0].s3Path, props.selectedMod, 0);
        }
    }, [props.selectedFilesInfo]);

    useEffect(() => {
        if (props.fileContent !== undefined && props.areFilesContentCurrent) {
            setIsLoading(true);
            processDataLoad(props.fileContent).then(res => {
                setIsLoading(false);
            });
        } else {
            if (props.selectedFilesInfo[0] !== undefined) {
                setIsLoading(true);
            } else {
                setIsLoading(false);
                setShowError(true);
            }
        }
    }, [props.fileContent, props.viewPageNum, props.selectedFilesInfo])

    const processDataLoad = (response) => {
        return new Promise((resolve, reject) => {
            let tempRowsTableLoad = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
            let tempRowsTableStats = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
            setRowsTableLoad([]);
            let skipCount = (props.viewPageNum - 1) * props.viewEntriesPerPage - 1;
            let doneCount = props.viewPageNum * props.viewEntriesPerPage - 1;
            let matchCount = 0;
            let fieldsMatchCount = [];
            let showFieldsMatchCount = [];
            props.diffFields.forEach(diffField => {
                showFieldsMatchCount[diffField.name] = props.viewSelectedDisplayFields[diffField.name] === true;
                fieldsMatchCount[diffField.name] = 0;
            });
            for (let field in response.general_stats) {
                if (field.match(/_with_null_/)) {
                    continue;
                }
                let renamedField = field;
                if (renamedField.match(/_with_non_null_/)) {
                    renamedField = renamedField.replace(/_with_non_null_/, "_with_");
                }
                let value = response.general_stats[field];
                if (value === null) {
                    value = 0;
                }
                if (value % 1 !== 0) {
                    value = value.toFixed(2);
                }
                const item = {field: renamedField, value: value};
                tempRowsTableStats.push(item);
                if (field === "number_genes_with_non_null_description") {		// for now while Valerio hasn't put the stat in
                    let thisValue = response.general_stats["total_number_of_genes"] - response.general_stats["number_genes_with_non_null_description"];
                    const item = {field: "number_genes_with_no_description", value: thisValue};
                    tempRowsTableStats.push(item);
                }
            }
            setRowsTableLoadStats(tempRowsTableStats);

            for (let i in response.data) {
                let gene_id = response.data[i].gene_id;
                let gene_name = response.data[i].gene_name;
                let geneHasSomeData = false;
                let gene_ontology_ids = [];
                let count_set_final_go_ids_f = 0;
                let count_set_final_go_ids_p = 0;
                let count_set_final_go_ids_c = 0;
                if ('set_final_go_ids_f' in response.data[i].stats) {
                    for (let j in response.data[i].stats.set_final_go_ids_f) {
                        gene_ontology_ids.push(response.data[i].stats.set_final_go_ids_f[j]);
                    }
                    count_set_final_go_ids_f = response.data[i].stats.set_final_go_ids_f.length;
                }
                if ('set_final_go_ids_p' in response.data[i].stats) {
                    for (let j in response.data[i].stats.set_final_go_ids_p) {
                        gene_ontology_ids.push(response.data[i].stats.set_final_go_ids_p[j]);
                    }
                    count_set_final_go_ids_p = response.data[i].stats.set_final_go_ids_p.length;
                }
                if ('set_final_go_ids_c' in response.data[i].stats) {
                    for (let j in response.data[i].stats.set_final_go_ids_c) {
                        gene_ontology_ids.push(response.data[i].stats.set_final_go_ids_c[j]);
                    }
                    count_set_final_go_ids_c = response.data[i].stats.set_final_go_ids_c.length;
                }
                let count_set_final_go_ids = count_set_final_go_ids_f + count_set_final_go_ids_p + count_set_final_go_ids_c;
                if ('set_final_do_ids' in response.data[i].stats) {
                    for (let j in response.data[i].stats.set_final_do_ids) {
                        gene_ontology_ids.push(response.data[i].stats.set_final_do_ids[j]);
                    }
                }
                if ('set_final_expression_ids' in response.data[i].stats) {
                    for (let j in response.data[i].stats.set_final_expression_ids) {
                        gene_ontology_ids.push(response.data[i].stats.set_final_expression_ids[j]);
                    }
                }

                if (((props.viewFilterMinFinalExpGOIDOp === '>=') &&
                    (count_set_final_go_ids >= props.viewFilterMinFinalExpGOIDCount))
                    || ((props.viewFilterMinFinalExpGOIDOp === '<=') &&
                        (count_set_final_go_ids <= props.viewFilterMinFinalExpGOIDCount))
                    || ((props.viewFilterMinFinalExpGOIDOp === '==') &&
                        (count_set_final_go_ids === props.viewFilterMinFinalExpGOIDCount))) {

                    props.diffFields.forEach(diffField => {
                        let diffFieldValue = response.data[i][diffField.name] || '';
                        if (props.viewSelectedDisplayFields[diffField.name] === true) {
                            if (((props.viewFilterHasData) && (diffFieldValue !== '')) ||
                                ((!props.viewFilterHasData) && (diffFieldValue === ''))) {
                                let keywordPass = false;
                                let genenamePass = false;
                                let ontologyPass = false;
                                if (props.diffFilterPhrase === '') {
                                    keywordPass = true;
                                } else {
                                    let lines = props.diffFilterPhrase.split("\n");
                                    for (let k in lines) {
                                        if (props.diffFilterPhraseCS === false) {
                                            if (diffFieldValue.toUpperCase().includes(lines[k].toUpperCase())) {
                                                keywordPass = true;
                                            }
                                        } else {
                                            if (diffFieldValue.includes(lines[k])) {
                                                keywordPass = true;
                                            }
                                        }
                                    }
                                }
                                if (props.diffFilterGeneName === '') {
                                    genenamePass = true;
                                } else {
                                    let lines = props.diffFilterGeneName.split("\n");
                                    for (let k in lines) {
                                        if (props.diffFilterGeneNameSubstr === true) {	// substring search
                                            if (props.diffFilterGeneNameCS === false) {	// not case sensitive
                                                if (gene_name.toUpperCase().includes(lines[k].toUpperCase())) {
                                                    genenamePass = true;
                                                }
                                            } else {							// case sensitive
                                                if (gene_name.includes(lines[k])) {
                                                    genenamePass = true;
                                                }
                                            }
                                        } else {							// exact match search
                                            if (props.diffFilterGeneNameCS === false) {	// not case sensitive
                                                if (gene_name.toUpperCase() === lines[k].toUpperCase()) {
                                                    genenamePass = true;
                                                }
                                            } else {							// case sensitive
                                                if (gene_name === lines[k]) {
                                                    genenamePass = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (props.viewFilterOntologyID === '') {
                                    ontologyPass = true;
                                } else {
                                    let lines = props.viewFilterOntologyID.split("\n");
                                    for (let k in lines) {
                                        for (let l in gene_ontology_ids) {
                                            if (lines[k].toUpperCase() === gene_ontology_ids[l].toUpperCase()) {
                                                ontologyPass = true;
                                            }
                                        }
                                    }
                                }
                                if ((keywordPass === true) && (genenamePass === true) && (ontologyPass === true)) {
                                    geneHasSomeData = true;
                                    fieldsMatchCount[diffField.name] += 1;
                                    if ((matchCount > skipCount) && (matchCount <= doneCount)) {
                                        const item = {
                                            gene_id: gene_id,
                                            gene_name: gene_name,
                                            field: diffField.name,
                                            text: diffFieldValue
                                        };
                                        tempRowsTableLoad.push(item);
                                    }
                                }
                            }
                        }
                    });

                    if (geneHasSomeData) {
                        matchCount++;
                    }
                }
            }
            setRowsTableLoad(tempRowsTableLoad);
            setLoadFieldsMatchCount(fieldsMatchCount);
            setShowLabelFieldsMatchCount(showFieldsMatchCount);
            resolve();
        });
    }

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <h5>View a File</h5>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    {isLoading ?
                        <Spinner animation="grow" />
                        : null}
                    {showError ?
                        'No files selected' : null}
                    {!isLoading && !showError ?
                        <>
                            <label>
                                General Stats:
                                <table
                                    name="table_load_stats"
                                    id="table_load_stats" >
                                    <thead>
                                    <tr>
                                        <th>field</th>
                                        <th>value</th>
                                    </tr>
                                    </thead>
                                    <tbody id="table_load_stats_body" name="table_load_stats_body">
                                    {rowsTableLoadStats.map((item, idx) => (
                                        <tr id="addr0" key={idx}>
                                            <td>{rowsTableLoadStats[idx].field}</td>
                                            <td>{rowsTableLoadStats[idx].value}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </label>
                            <br />
                            <label>
                                Field counts: <br />
                            </label>
                            {props.diffFields.map(function(item){
                                if (showLabelFieldsMatchCount !== undefined) {
                                    return (
                                        <label style={{display: showLabelFieldsMatchCount[item.name] ? 'block' : 'none'}}>
                                            {item.label} count: {loadFieldsMatchCount[item.name]}<br/>
                                        </label>
                                    )}}, this)}
                            <br />

                            <label>
                                File Load Result:<br/>
                                <input type="button" value="Previous Page" onClick={handleSubmitLoadPrevPage}/>
                                &nbsp;&nbsp;Page {props.viewPageNum}&nbsp;&nbsp;
                                <input type="button" value="Next Page" onClick={handleSubmitLoadNextPage}/><br/>
                            </label>
                            <label>
                                <table
                                    name="table_load"
                                    id="table_load" >
                                    <thead>
                                    <tr>
                                        <th id="header_geneid" name="header_geneid">Gene ID</th>
                                        <th id="header_genename" name="header_genename">Gene Name</th>
                                        <th id="header_field" name="header_field">Field</th>
                                        <th id="header_text" name="header_text">Text</th>
                                    </tr>
                                    </thead>
                                    <tbody id="table_load_body" name="table_load_body">
                                    {rowsTableLoad.map((item, idx) => (
                                        <tr id="addr0" key={idx}>
                                            <td>{rowsTableLoad[idx].gene_id}</td>
                                            <td>{rowsTableLoad[idx].gene_name}</td>
                                            <td>{rowsTableLoad[idx].field}</td>
                                            <td>{rowsTableLoad[idx].text}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table><br/>
                            </label>
                            <label>
                                <input type="button" value="Previous Page" onClick={handleSubmitLoadPrevPage}/>
                                &nbsp;&nbsp;Page {props.viewPageNum}&nbsp;&nbsp;
                                <input type="button" value="Next Page" onClick={handleSubmitLoadNextPage}/><br/>
                                <br/>
                            </label>
                        </> : null}
                </Col>
            </Row>
        </Container>
    );
}

const mapStateToProps = state => ({
    viewPageNum: getViewPageNum(state),
    viewEntriesPerPage: getViewEntriesPerPage(state),
    fileContent: getFilesContent(state)[0],
    selectedFilesInfo: getSelectedFilesInfo(state),
    selectedMod: getSelectedMod(state),
    viewFilterOntologyID: getViewFilterOntologyID(state),
    viewFilterMinFinalExpGOIDOp: getViewFilterMinFinalExpGOIDOp(state),
    viewFilterMinFinalExpGOIDCount: getViewFilterMinFinalExpGOIDCount(state),
    diffFields: getDiffFields(state),
    viewFilterHasData: getViewFilterHasData(state),
    diffFilterPhrase: getDiffFilterPhrase(state),
    diffFilterPhraseCS: getDiffFilterPhraseCS(state),
    diffFilterGeneName: getDiffFilterGeneName(state),
    diffFilterGeneNameCS: getDiffFilterGeneNameCS(state),
    diffFilterGeneNameSubstr: getDiffFilterGeneNameSubstr(state),
    areFilesContentCurrent: areFilesContentCurrent(state),
    viewSelectedDisplayFields: getViewSelectedDisplayFields(state)
});

export default connect(mapStateToProps, {fetchFileContent, setViewPageNum})(ViewFileViewer);