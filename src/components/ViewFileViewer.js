import React, {useEffect, useMemo, useState} from 'react';
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
    getViewFilterHasData,
    getViewFilterMinFinalExpGOIDCount,
    getViewFilterMinFinalExpGOIDOp,
    getViewFilterOntologyID,
    getViewSelectedDisplayFields
} from "../redux/selectors";
import {Button, Col, Container, Row, Spinner} from "react-bootstrap";
import {fetchFileContent} from "../redux/actions";
import {statFieldIsFirstOption} from "../lib";
import {AgGridReact} from 'ag-grid-react';

const ViewFileViewer = (props) => {

    const [rowsTableLoad, setRowsTableLoad] = useState([]);
    const [rowsTableLoadStats, setRowsTableLoadStats] = useState([]);
    const [loadFieldsMatchCount, setLoadFieldsMatchCount] = useState({});
    const [showLabelFieldsMatchCount, setShowLabelFieldsMatchCount] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showError, setShowError] = useState(false);
    const [showAllGeneralStats, setShowAllGeneralStats] = useState(false);

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
    }, [props.fileContent, props.selectedFilesInfo])

    const processDataLoad = (response) => {
        return new Promise((resolve, reject) => {
            let tempRowsTableLoad = [];
            let tempRowsTableStats = [];
            setRowsTableLoad([]);
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
                if (field === "number_genes_with_non_null_description") {
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
                                        if (props.diffFilterGeneNameSubstr === true) {
                                            if (props.diffFilterGeneNameCS === false) {
                                                if (gene_name.toUpperCase().includes(lines[k].toUpperCase())) {
                                                    genenamePass = true;
                                                }
                                            } else {
                                                if (gene_name.includes(lines[k])) {
                                                    genenamePass = true;
                                                }
                                            }
                                        } else {
                                            if (props.diffFilterGeneNameCS === false) {
                                                if (gene_name.toUpperCase() === lines[k].toUpperCase()) {
                                                    genenamePass = true;
                                                }
                                            } else {
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
                    });

                    if (geneHasSomeData) {
                        // matchCount tracked implicitly by tempRowsTableLoad length
                    }
                }
            }
            setRowsTableLoad(tempRowsTableLoad);
            setLoadFieldsMatchCount(fieldsMatchCount);
            setShowLabelFieldsMatchCount(showFieldsMatchCount);
            resolve();
        });
    }

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        wrapText: true,
        autoHeight: true,
    }), []);

    const loadColumnDefs = useMemo(() => [
        {headerName: 'Gene ID', field: 'gene_id', width: 140, wrapText: false, autoHeight: false},
        {headerName: 'Gene Name', field: 'gene_name', width: 130, wrapText: false, autoHeight: false},
        {headerName: 'Field', field: 'field', width: 180, wrapText: false, autoHeight: false},
        {headerName: 'Text', field: 'text', flex: 1},
    ], []);

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <h5>View a File</h5>
                </Col>
            </Row>
            <Row>
                <Col>
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
                                    {rowsTableLoadStats.filter(item => showAllGeneralStats || statFieldIsFirstOption(item.field)).map(item => (
                                        <tr>
                                            <td>{item.field}</td>
                                            <td>{item.value}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <br/>
                                <Button variant="outline-success" onClick={() => setShowAllGeneralStats(!showAllGeneralStats)}>{showAllGeneralStats ? "Show less stats" : "Show more stats"}</Button>
                                <br/>
                                <br/>
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

                            <label>File Load Result:</label>
                            <div style={{width: '100%', minHeight: 400}}>
                                <AgGridReact
                                    rowData={rowsTableLoad}
                                    columnDefs={loadColumnDefs}
                                    defaultColDef={defaultColDef}
                                    domLayout="autoHeight"
                                    pagination={true}
                                    paginationPageSize={50}
                                    paginationPageSizeSelector={[20, 50, 100, 500]}
                                />
                            </div>
                        </> : null}
                </Col>
            </Row>
        </Container>
    );
}

const mapStateToProps = state => ({
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

export default connect(mapStateToProps, {fetchFileContent})(ViewFileViewer);
