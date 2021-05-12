import React, {useEffect, useState} from 'react';
import {
    getDiffFilterGeneName,
    getSelectedDiffField,
    getDiffFilterGeneNameCS,
    getDiffFilterGeneNameSubstr,
    getDiffFilterPhrase,
    getDiffFilterPhraseCS,
    getFilesContent,
    getSelectedFilesInfo,
    getSelectedMod,
    areFilesContentCurrent
} from "../redux/selectors";
import {connect} from "react-redux";
import {Col, Container, Row, Spinner} from "react-bootstrap";
import {fetchFileContent} from "../redux/actions";


const DiffViewer = (props) => {

    const [rowsTableDiffStats, setRowsTableDiffStats] = useState([]);
    const [rowsTableDiff, setRowsTableDiff] = useState([]);
    const [textDivDiffResults, setTextDivDiffResults] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (props.selectedFilesInfo[0] !== undefined && props.selectedFilesInfo[1] !== undefined && !props.areFilesContentCurrent) {
            props.fetchFileContent(props.selectedFilesInfo[0].s3Path, props.selectedMod, 0);
            props.fetchFileContent(props.selectedFilesInfo[1].s3Path, props.selectedMod, 1);
        }
    }, [props.selectedFilesInfo]);

    useEffect(() => {
        if (props.filesContent[0] !== undefined && props.filesContent[1] !== undefined) {
            setIsLoading(true);
            processDataCompare(props.filesContent[0], props.filesContent[1]).then(res => {
                setIsLoading(false);
            });
        } else {
            if (props.selectedFilesInfo[0] !== undefined && props.selectedFilesInfo[1] !== undefined) {
                setIsLoading(true);
            } else {
                setIsLoading(false);
                setShowError(true);
            }
        }
    }, [props.filesContent, props.selectedFilesInfo]);


    const processDataCompare = (response1, response2) => {
        return new Promise((resolve, reject) => {
            let retTextDivDiffResults = "";
            let tempRowsTableDiff = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
            let tempRowsTableStats = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
            setRowsTableDiffStats([]);
            setRowsTableDiff([]);

            for (let field in response1.general_stats) {
                if (field.match(/_with_null_/)) { continue; }
                let renamedField = field;
                if (renamedField.match(/_with_non_null_/)) {
                    renamedField = renamedField.replace(/_with_non_null_/, "_with_"); }
                let value1 = response1.general_stats[field];
                let value2 = response2.general_stats[field];
                if (value1 === null) { value1 = 0; }
                if (value2 === null) { value2 = 0; }
                if (value1 % 1 !== 0) { value1 = value1.toFixed(2); }
                if (value2 % 1 !== 0) { value2 = value2.toFixed(2); }
                const item = {field: renamedField, date1: value1, date2: value2};
                tempRowsTableStats.push(item);
                if (field === "number_genes_with_non_null_description") {		// for now while Valerio hasn't put the stat in
                    let thisValue1 = response1.general_stats["total_number_of_genes"] - response1.general_stats["number_genes_with_non_null_description"];
                    let thisValue2 = response2.general_stats["total_number_of_genes"] - response2.general_stats["number_genes_with_non_null_description"];
                    const item = {field: "number_genes_with_no_description", date1: thisValue1, date2: thisValue2};
                    tempRowsTableStats.push(item);
                }
            }
            setRowsTableDiffStats(tempRowsTableStats);
            let maps = {};
            maps['file1'] = {};
            maps['file2'] = {};
            for (let index in response1.data) {
                let gene = response1['data'][index]['gene_id'];
                maps['file1'][gene] = {};
                maps['file1'][gene]['index'] = index; }
            for (let index in response2.data) {
                let gene = response2['data'][index]['gene_id'];
                maps['file2'][gene] = {};
                maps['file2'][gene]['index'] = index; }

            setTextDivDiffResults("");
            let createdGenes = {};
            createdGenes['text'] = [];
            createdGenes['null'] = [];
            for (let gene in maps.file2) {
                if (maps['file1'][gene] === undefined) {
                    let index2 = maps['file2'][gene]['index'];
                    let desc2 = response2['data'][index2][props.selectedDiffField];
                    if (desc2 === null || desc2 === undefined) { createdGenes['null'].push(gene); }
                    else { createdGenes['text'].push(gene); } } }
            let createdGenesText = 'None';
            let createdGenesNull = 'None';
            if (!(createdGenes['text'] === undefined || createdGenes['text'].length === 0)) {
                createdGenesText = createdGenes['text'].join(', '); }
            if (!(createdGenes['null'] === undefined || createdGenes['null'].length === 0)) {
                createdGenesNull = createdGenes['null'].join(', '); }
            retTextDivDiffResults += "Created Genes with Text in description:\n" + createdGenesText + "\n\n";
            retTextDivDiffResults += "Created Genes with Null in description:\n" + createdGenesNull + "\n\n";

            let removedGenes = {};
            removedGenes['text'] = [];
            removedGenes['null'] = [];
            for (let gene in maps.file1) {
                if (maps['file2'][gene] === undefined) {
                    let index1 = maps['file1'][gene]['index'];
                    let desc1 = response1['data'][index1][props.selectedDiffField];
                    if (desc1 === null || desc1 === undefined) { removedGenes['null'].push(gene); }
                    else { removedGenes['text'].push(gene); } } }
            let removedGenesText = 'None';
            let removedGenesNull = 'None';
            if (!(removedGenes['text'] === undefined || removedGenes['text'].length === 0)) {
                removedGenesText = removedGenes['text'].join(', '); }
            if (!(removedGenes['null'] === undefined || removedGenes['null'].length === 0)) {
                removedGenesNull = removedGenes['null'].join(', '); }
            retTextDivDiffResults += "Removed Genes with Text in description:\n" + removedGenesText + "\n\n";
            retTextDivDiffResults += "Removed Genes with Null in description:\n" + removedGenesNull + "\n\n";

            if (props.diffFilterPhrase !== '') {
                retTextDivDiffResults += "Filtering on keyword " + props.diffFilterPhrase + "\n\n";
            }
            else {
                retTextDivDiffResults += "Not filtering on a keyword\n\n";
            }

            let countDifferencesInDescription = 0;
            for (let gene in maps.file1) {
                let index1 = maps['file1'][gene]['index'];
                let name1 = response1['data'][index1]['gene_name'];
                let desc1 = '';
                let desc2 = '';
                if (response1['data'][index1][props.selectedDiffField] !== undefined) {
                    if (response1['data'][index1][props.selectedDiffField] !== null) {
                        desc1 = response1['data'][index1][props.selectedDiffField]; } }
                if (!(maps['file2'][gene] === undefined)) {
                    let index2 = maps['file2'][gene]['index'];
                    if (response2['data'][index2][props.selectedDiffField] !== undefined) {
                        if (response2['data'][index2][props.selectedDiffField] !== null) {
                            desc2 = response2['data'][index2][props.selectedDiffField]; } } }

                if ((desc1 !== desc2) && ((desc2 !== '') || (desc1 !== ''))) {
                    let keywordPass = false;
                    let genenamePass = false;
                    let lines = props.diffFilterPhrase.split("\n");
                    for (let k in lines) {
                        if (props.diffFilterPhraseCS === false) {
                            if (desc1.toUpperCase().includes(lines[k].toUpperCase()) ||
                                desc2.toUpperCase().includes(lines[k].toUpperCase())) {
                                keywordPass = true; } }
                        else {
                            if (desc1.includes(lines[k]) ||
                                desc2.includes(lines[k])) {
                                keywordPass = true; } } }

                    if (props.diffFilterGeneName === '') { genenamePass = true; }
                    else {
                        lines = props.diffFilterGeneName.split("\n");
                        for (let k in lines) {
                            if (props.diffFilterGeneNameSubstr === true) {	// substring search
                                if (props.diffFilterGeneNameCS === false) {	// not case sensitive
                                    if (name1.toUpperCase().includes(lines[k].toUpperCase())) {
                                        genenamePass = true; } }
                                else {							// case sensitive
                                    if (name1.includes(lines[k])) {
                                        genenamePass = true; } } }
                            else {
                                if (props.diffFilterGeneNameCS === false) {	// exact match
                                    if (name1.toUpperCase() === lines[k].toUpperCase()) {	// not case sensitive
                                        genenamePass = true; } }
                                else {							// case sensitive
                                    if (name1 === lines[k]) {
                                        genenamePass = true; } } } } }

                    if ( (keywordPass === true) && (genenamePass === true) ) {
                        countDifferencesInDescription++;
                        const item = {geneid: gene, genename: name1, desc1: desc1, desc2: desc2};
                        tempRowsTableDiff.push(item);
                    }
                }
            }
            retTextDivDiffResults += "Count of differences in description: " + countDifferencesInDescription + "\n\n";
            setTextDivDiffResults(retTextDivDiffResults);
            setRowsTableDiff(tempRowsTableDiff);
            resolve();
        });

    }

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <h5>Compare Files</h5>
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
                        <div>
                            General Stats:
                            <table
                                name="table_diff_stats"
                                id="table_diff_stats" >
                                <thead>
                                <tr>
                                    <th>field</th>
                                    <th id="header_stats_date1" name="header_stats_date1">{props.selectedFilesInfo[0] ? props.selectedFilesInfo[0].uploadDate : ''}</th>
                                    <th id="header_stats_date2" name="header_stats_date2">{props.selectedFilesInfo[1] ? props.selectedFilesInfo[1].uploadDate : ''}</th>
                                </tr>
                                </thead>
                                <tbody id="table_diff_stats_body" name="table_diff_stats_body">
                                {rowsTableDiffStats.map((item, idx) => (
                                    <tr id="addr0" key={idx}>
                                        <td>{rowsTableDiffStats[idx].field}</td>
                                        <td>{rowsTableDiffStats[idx].date1}</td>
                                        <td>{rowsTableDiffStats[idx].date2}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div
                                name="div_diff_results_text"
                                id="div_diff_results_text"
                                style={{whiteSpace: 'pre-line'}}>
                                {textDivDiffResults}
                            </div>
                            <table
                                name="table_diff"
                                id="table_diff" >
                                <thead>
                                <tr>
                                    <th>gene</th>
                                    <th>name</th>
                                    <th id="header_diff_date1" name="header_diff_date1">{props.selectedFilesInfo[0] ? props.selectedFilesInfo[0].uploadDate : ''}</th>
                                    <th id="header_diff_date2" name="header_diff_date2">{props.selectedFilesInfo[1] ? props.selectedFilesInfo[1].uploadDate : ''}</th>
                                </tr>
                                </thead>
                                <tbody id="table_diff_body" name="table_diff_body">
                                {rowsTableDiff.map((item, idx) => (
                                    <tr id="addr0" key={idx}>
                                        <td>{rowsTableDiff[idx].geneid}</td>
                                        <td>{rowsTableDiff[idx].genename}</td>
                                        <td>{rowsTableDiff[idx].desc1}</td>
                                        <td>{rowsTableDiff[idx].desc2}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div> : null}
                </Col>
            </Row>
        </Container>
    )
}

const mapStateToProps = state => ({
    selectedDiffField: getSelectedDiffField(state),
    selectedMod: getSelectedMod(state),
    diffFilterGeneName: getDiffFilterGeneName(state),
    diffFilterGeneNameCS: getDiffFilterGeneNameCS(state),
    diffFilterGeneNameSubstr: getDiffFilterGeneNameSubstr(state),
    diffFilterPhrase: getDiffFilterPhrase(state),
    diffFilterPhraseCS: getDiffFilterPhraseCS(state),
    selectedFilesInfo: getSelectedFilesInfo(state),
    filesContent: getFilesContent(state),
    areFilesContentCurrent: areFilesContentCurrent(state)
});

export default connect(mapStateToProps, {fetchFileContent})(DiffViewer)