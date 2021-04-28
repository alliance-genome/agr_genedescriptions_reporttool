import { connect } from 'react-redux'
import '../index.css';
import pako from 'pako';
import axios from 'axios';
import {generateFmsJsonUrl, getHtmlVar} from "../lib";
import React, {useEffect, useState} from 'react';
import ModSelector from "./ModSelector";
import {
  fetchFilesFromFMS,
  fetchModsList,
  setDescriptionFileForDiff,
  setDiffFields,
  setModsList
} from "../redux/actions";
import {
  getDescriptionFileObjects,
  getDiffFields,
  getDiffFileObjs,
  getLatestFilesOnly,
  getSelectedMod
} from "../redux/selectors";


const ReportTool = (props) => {

  const [pageNumber, setPageNumber] = useState(1);
  const [diffField, setDiffField] = useState(undefined);
  const [diffGeneNameFilter, setDiffGeneNameFilter] = useState('');
  const [loadComparisonGoids, setLoadComparisonGoids] = useState('>=');
  const [loadGoidsCount, setLoadGoidsCount] = useState(0);
  const [checkboxHasData, setCheckboxHasData] = useState(true);
  const [loadKeywordFilter, setLoadKeywordFilter] = useState('');
  const [checkboxLoadKeywordFilter, setCheckboxLoadKeywordFilter] = useState(false)
  const [loadGeneNameFilter, setLoadGeneNameFilter] = useState('');
  const [checkboxLoadGeneNameFilter, setCheckboxLoadGeneNameFilter] = useState(false);
  const [checkboxLoadGeneNameSubstring, setCheckboxLoadGeneNameSubstring] = useState(false);
  const [loadOntologyFilter, setLoadOntologyFilter] = useState('');
  const [textDivDiffResults, setTextDivDiffResults] = useState('');
  const [diffKeywordFilter, setDiffKeywordFilter] = useState('');
  const [checkboxDiffKeywordFilter, setCheckboxDiffKeywordFilter] = useState(false);
  const [checkboxDiffGeneNameFilter, setCheckboxDiffGeneNameFilter] = useState(false);
  const [checkboxDiffGeneNameSubstring, setCheckboxDiffGeneNameSubstring] = useState(false);
  const [showDivTopArrowButton, setShowDivTopArrowButton] = useState(false);
  const [showDivMenuButton2A, setShowDivMenuButton2A] = useState(false);
  const [showDivMenuButton2C, setShowDivMenuButton2C] = useState(false);
  const [backgroundDiffTab, setBackgroundDiffTab] = useState('white');
  const [backgroundDownloadTab, setBackgroundDownloadTab] = useState('white');
  const [backgroundLoadTab, setBackgroundLoadTab] = useState('white');
  const [showDivDiffSection, setShowDivDiffSection] = useState(false);
  const [showDivDiffLoading, setShowDivDiffLoading] = useState(false);
  const [showDivDiffResult, setShowDivDiffResult] = useState(false);
  const [rowsTableDiffStats, setRowsTableDiffStats] = useState([]);
  const [rowsTableDiff, setRowsTableDiff] = useState([]);
  const [showDivDownloadSection, setShowDivDownloadSection] = useState(false);
  const [showDownloadLink, setShowDownloadLink] = useState(false);
  const [downloadLinkUrl, setDownloadLinkUrl] = useState('');
  const [downloadLinkText, setDownloadLinkText] = useState('');
  const [showDivLoadSection, setShowDivLoadSection] = useState(false);
  const [showDivLoadLoading, setShowDivLoadLoading] = useState(false);
  const [showDivLoadResult, setShowDivLoadResult] = useState(false);
  const [rowsTableLoadStats, setRowsTableLoadStats] = useState([]);
  const [showLabelFieldsMatchCount, setShowLabelFieldsMatchCount] = useState(undefined);
  const [loadFieldsMatchCount, setLoadFieldsMatchCount] = useState(undefined);
  const [rowsTableLoad, setRowsTableLoad] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(100);

  useEffect(() => {
    props.fetchModsList(getHtmlVar().get('mod'));
  }, [])

  useEffect(() => {
    if (props.selectedMod) {
      props.fetchFilesFromFMS(props.latestFilesOnly, props.selectedMod);
    }
  }, [props.selectedMod]);


  const requestAndGunzipBodyIfNecessary = (url) => {
    return new Promise((resolve, reject) => {
      axios.get(url, { responseType: 'arraybuffer' })
          .then(function (response) {
            if (response.headers['content-type'] === 'application/x-gzip') {
              resolve(JSON.parse(pako.inflate(response.data, {to: 'string'})));
            } else {
              resolve(JSON.parse(response.data));
            }
          })
          .catch(function (error) {
            reject(error);
          });
    })
  }

  const processSubmitLoadAction = () => {
    setShowDivDiffResult(false);
    let errorMessage = '';
    if (props.descriptionFileObj1 === undefined) { errorMessage += 'Choose a file\n';  }
    if (props.selectedMod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let urlLoad = generateFmsJsonUrl(props.diffFileObj1.s3Path, props.selectedMod);
    setShowDivMenuButton2C(true);
    setShowDivTopArrowButton(true);
    var element = document.getElementById("anchor2Cresult");
    element.scrollIntoView();
    setShowDivLoadLoading(true);

    requestAndGunzipBodyIfNecessary(urlLoad).then(res => processDataLoad(res));

  } // processSubmitLoadAction()

  const processDataLoad = (response) => {
    let tempRowsTableLoad = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
    let tempRowsTableStats = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
    setRowsTableLoad([]);
    setShowDivLoadResult(true);
    setShowDivLoadLoading(false);
    let skipCount = (pageNumber - 1) * entriesPerPage - 1;
    let doneCount = pageNumber * entriesPerPage - 1;
    let matchCount = 0;
    let fieldsMatchCount = [];
    let showFieldsMatchCount = [];
    Object.keys(props.diffFields).forEach(diffField => {
      showFieldsMatchCount[diffField] = props.diffFields[diffField] === true;
      fieldsMatchCount[diffField] = 0;
    });
    for (let field in response.general_stats) {
      if (field.match(/_with_null_/)) { continue; }
      let renamedField = field;
      if (renamedField.match(/_with_non_null_/)) {
        renamedField = renamedField.replace(/_with_non_null_/, "_with_"); }
      let value = response.general_stats[field];
      if (value === null) { value = 0; }
      if (value % 1 !== 0) { value = value.toFixed(2); }
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
          gene_ontology_ids.push(response.data[i].stats.set_final_go_ids_f[j]); }
        count_set_final_go_ids_f = response.data[i].stats.set_final_go_ids_f.length; }
      if ('set_final_go_ids_p' in response.data[i].stats) {
        for (let j in response.data[i].stats.set_final_go_ids_p) {
          gene_ontology_ids.push(response.data[i].stats.set_final_go_ids_p[j]); }
        count_set_final_go_ids_p = response.data[i].stats.set_final_go_ids_p.length; }
      if ('set_final_go_ids_c' in response.data[i].stats) {
        for (let j in response.data[i].stats.set_final_go_ids_c) {
          gene_ontology_ids.push(response.data[i].stats.set_final_go_ids_c[j]); }
        count_set_final_go_ids_c = response.data[i].stats.set_final_go_ids_c.length; }
      let count_set_final_go_ids = count_set_final_go_ids_f + count_set_final_go_ids_p + count_set_final_go_ids_c;
      if ('set_final_do_ids' in response.data[i].stats) {
        for (let j in response.data[i].stats.set_final_do_ids) {
          gene_ontology_ids.push(response.data[i].stats.set_final_do_ids[j]); } }
      if ('set_final_expression_ids' in response.data[i].stats) {
        for (let j in response.data[i].stats.set_final_expression_ids) {
          gene_ontology_ids.push(response.data[i].stats.set_final_expression_ids[j]); } }

      if ( ( (loadComparisonGoids === '>=') &&
          (count_set_final_go_ids >= loadGoidsCount) )
          || ( (loadComparisonGoids === '<=') &&
              (count_set_final_go_ids <= loadGoidsCount) )
          || ( (loadComparisonGoids === '==') &&
              (count_set_final_go_ids === loadGoidsCount) ) ) {

        Object.keys(props.diffFields).forEach(diffField => {
          let diffFieldValue = response.data[i][diffField] || '';
          if (props.diffFields[diffField] === true) {
            if ( ( ( checkboxHasData ) && (diffFieldValue !== '') ) ||
                ( ( !checkboxHasData ) && (diffFieldValue === '') ) ) {
              let keywordPass = false;
              let genenamePass = false;
              let ontologyPass = false;
              if (loadKeywordFilter === '') { keywordPass = true; }
              else {
                let lines = loadKeywordFilter.split("\n");
                for (let k in lines) {
                  if (checkboxLoadKeywordFilter === false) {
                    if (diffFieldValue.toUpperCase().includes(lines[k].toUpperCase())) {
                      keywordPass = true; } }
                  else {
                    if (diffFieldValue.includes(lines[k])) {
                      keywordPass = true; } } } }
              if (loadGeneNameFilter === '') { genenamePass = true; }
              else {
                let lines = loadGeneNameFilter.split("\n");
                for (let k in lines) {
                  if (checkboxLoadGeneNameSubstring === true) {	// substring search
                    if (checkboxLoadGeneNameFilter === false) {	// not case sensitive
                      if (gene_name.toUpperCase().includes(lines[k].toUpperCase())) {
                        genenamePass = true; } }
                    else {							// case sensitive
                      if (gene_name.includes(lines[k])) {
                        genenamePass = true; } } }
                  else {							// exact match search
                    if (checkboxLoadGeneNameFilter === false) {	// not case sensitive
                      if (gene_name.toUpperCase() === lines[k].toUpperCase()) {
                        genenamePass = true; } }
                    else {							// case sensitive
                      if (gene_name === lines[k]) {
                        genenamePass = true; } } } } }
              if (loadOntologyFilter === '') { ontologyPass = true; }
              else {
                let lines = loadOntologyFilter.split("\n");
                for (let k in lines) {
                  for (let l in gene_ontology_ids) {
                    if (lines[k].toUpperCase() === gene_ontology_ids[l].toUpperCase()) { ontologyPass = true; } }
                } }
              if ( (keywordPass === true) && (genenamePass === true) && (ontologyPass === true) ) {
                geneHasSomeData = true;
                fieldsMatchCount[diffField] += 1;
                if ( (matchCount > skipCount) && (matchCount <= doneCount) ) {
                  const item = {gene_id: gene_id, gene_name: gene_name, field: diffField, text: diffFieldValue};
                  tempRowsTableLoad.push(item);
                }
              }
            }
          }
        });

        if (geneHasSomeData) { matchCount++; }
      }
    }
    setRowsTableLoad(tempRowsTableLoad);
    setLoadFieldsMatchCount(fieldsMatchCount);
    setShowLabelFieldsMatchCount(showFieldsMatchCount);
  } // processDataLoad()

  const handleSubmitLoadNextPage = (event) => {
    event.preventDefault();
    let nextPage = pageNumber + 1;
    setPageNumber(nextPage);
    processSubmitLoadAction();
  }

  const handleSubmitLoadPrevPage = (event) => {
    event.preventDefault();
    let prevPage = pageNumber - 1;
    if (prevPage < 1) { prevPage = 1; }
    setPageNumber(prevPage);
    processSubmitLoadAction();
  }

  const handleSubmitLoad = (event) => {
    event.preventDefault();
    processSubmitLoadAction();
  }


  const handleSubmitGenerateLink = (event) => {
    event.preventDefault();
    let errorMessage = '';
    if (props.diffFileObj1 === undefined) { errorMessage += 'Choose a file\n';  }
    if (props.selectedMod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let urlDownload = generateFmsJsonUrl(props.diffFileObj1.s3Path, props.selectedMod);

    let filename = props.diffFileObj1.uploadDate + '_' + props.selectedMod + '.json';
    let downloadLink = document.createElement("a");
    downloadLink.setAttribute( 'href', urlDownload );
    downloadLink.setAttribute( 'target', '_blank' );
    downloadLink.setAttribute( 'download', filename );
    let downloadText = 'download ' + filename;
    downloadLink.innerHTML = downloadText;
    setDownloadLinkUrl(urlDownload);

    downloadText = urlDownload;

    setDownloadLinkText(downloadText);
    setShowDownloadLink(true);
  }

  const handleSubmitOpenTab = (event) => {
    event.preventDefault();
    let errorMessage = '';
    if (props.diffFileObj1 === undefined) { errorMessage += 'Choose a file\n';  }
    if (props.selectedMod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let urlDownload = generateFmsJsonUrl(props.diffFileObj1.s3Path, props.selectedMod);
    window.open(urlDownload);
  }

  const handleClickShowSectionDiff = (event) => {
    setShowDivDiffSection(true);
    setShowDivDownloadSection(false);
    setShowDivLoadSection(false);
    setBackgroundDiffTab('#ddd');
    setBackgroundDownloadTab('white');
    setBackgroundLoadTab('white');
    event.preventDefault();
  }

  const handleClickShowSectionDownload = (event) => {
    setShowDivDiffSection(false);
    setShowDivDownloadSection(true);
    setShowDivLoadSection(false);
    setBackgroundDiffTab('white');
    setBackgroundDownloadTab('#ddd');
    setBackgroundLoadTab('white');
    event.preventDefault();
  }

  const handleClickShowSectionView = (event) => {
    setShowDivDiffSection(false);
    setShowDivDownloadSection(false);
    setShowDivLoadSection(true);
    setBackgroundDiffTab('white');
    setBackgroundDownloadTab('white');
    setBackgroundLoadTab('#ddd');
    event.preventDefault();
  }

  const handleClickTopArrowButton = (event) => {
    var element = document.getElementById("div_section_mod");
    element.scrollIntoView();
    setShowDivDiffResult(false);
    setShowDivLoadResult(false);
    event.preventDefault();
  }

  const handleClickButton2A = (event) => {
    var element = document.getElementById("anchor2Acontrol");
    element.scrollIntoView();
    event.preventDefault();
  }

  const handleClickButton2C = (event) => {
    var element = document.getElementById("anchor2Ccontrol");
    element.scrollIntoView();
    event.preventDefault();
  }

  const handleSubmitCompare = (event) => {
    let t0 = Date.now();
    event.preventDefault();
    let errorMessage = '';
    if (props.diffFileObj1 === undefined) {     errorMessage += 'Choose an old file\n';         }
    if (props.diffFileObj2 === undefined) {     errorMessage += 'Choose a new file\n';          }
    if (diffField === undefined) { errorMessage += 'Choose a field to compare\n';  }
    if (props.selectedMod === undefined) {       errorMessage += 'Choose a mod\n';               }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let url1 = generateFmsJsonUrl(props.diffFileObj1.s3Path, props.selectedMod);
    let url2 = generateFmsJsonUrl(props.diffFileObj2.s3Path, props.selectedMod);
    setShowDivDiffLoading(true);
    setShowDivMenuButton2A(true);
    setShowDivMenuButton2C(false);
    setShowDivTopArrowButton(true);
    setShowDivLoadResult(false);
    var element = document.getElementById("anchor2Aresult");
    element.scrollIntoView();

    requestAndGunzipBodyIfNecessary(url1).then((res1) => {
      requestAndGunzipBodyIfNecessary(url2).then((res2) => {
        processDataCompare(res1, res2, t0);
      })
    });

  } // handleSubmitCompare(event)


  const processDataCompare = (response1, response2, t0) => {
    let tempRowsTableDiff = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
    let tempRowsTableStats = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
    setShowDivDiffResult(true);
    setShowDivDiffLoading(false);
    setRowsTableDiffStats([]);
    setRowsTableDiff([]);

    for (let field in response1.general_stats) {
      if (field.match(/_with_null_/)) { continue; }
      let renamedField = field;
      if (renamedField.match(/_with_non_null_/)) {
        renamedField = renamedField.replace(/_with_non_null_/, "_with_"); }
//    if (urlRoot.match(/textpresso/)) { urlTemplate = urlRoot + 'index.xml'; }
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
        let desc2 = response2['data'][index2][diffField];
        if (desc2 === null || desc2 === undefined) { createdGenes['null'].push(gene); }
        else { createdGenes['text'].push(gene); } } }
    let createdGenesText = 'None';
    let createdGenesNull = 'None';
    if (!(createdGenes['text'] === undefined || createdGenes['text'].length === 0)) {
      createdGenesText = createdGenes['text'].join(', '); }
    if (!(createdGenes['null'] === undefined || createdGenes['null'].length === 0)) {
      createdGenesNull = createdGenes['null'].join(', '); }
    setTextDivDiffResults(textDivDiffResults.concat("Created Genes with Text in description:\n" + createdGenesText + "\n\n"));
    setTextDivDiffResults(textDivDiffResults.concat("Created Genes with Null in description:\n" + createdGenesNull + "\n\n"));

    let removedGenes = {};
    removedGenes['text'] = [];
    removedGenes['null'] = [];
    for (let gene in maps.file1) {
      if (maps['file2'][gene] === undefined) {
        let index1 = maps['file1'][gene]['index'];
        let desc1 = response1['data'][index1][diffField];
        if (desc1 === null || desc1 === undefined) { removedGenes['null'].push(gene); }
        else { removedGenes['text'].push(gene); } } }
    let removedGenesText = 'None';
    let removedGenesNull = 'None';
    if (!(removedGenes['text'] === undefined || removedGenes['text'].length === 0)) {
      removedGenesText = removedGenes['text'].join(', '); }
    if (!(removedGenes['null'] === undefined || removedGenes['null'].length === 0)) {
      removedGenesNull = removedGenes['null'].join(', '); }
    setTextDivDiffResults(textDivDiffResults.concat("Removed Genes with Text in description:\n" + removedGenesText + "\n\n"));
    setTextDivDiffResults(textDivDiffResults.concat("Removed Genes with Null in description:\n" + removedGenesNull + "\n\n"));

    if (diffKeywordFilter !== '') {
      setTextDivDiffResults(textDivDiffResults.concat("Filtering on keyword " + diffKeywordFilter + "\n\n"));
    }
    else {
      setTextDivDiffResults(textDivDiffResults.concat("Not filtering on a keyword\n\n"));
    }

    let countDifferencesInDescription = 0;
    for (let gene in maps.file1) {
      let index1 = maps['file1'][gene]['index'];
      let name1 = response1['data'][index1]['gene_name'];
      let desc1 = '';
      let desc2 = '';
      if (response1['data'][index1][diffField] !== undefined) {
        if (response1['data'][index1][diffField] !== null) {
          desc1 = response1['data'][index1][diffField]; } }
      if (!(maps['file2'][gene] === undefined)) {
        let index2 = maps['file2'][gene]['index'];
        if (response2['data'][index2][diffField] !== undefined) {
          if (response2['data'][index2][diffField] !== null) {
            desc2 = response2['data'][index2][diffField]; } } }

      if ((desc1 !== desc2) && ((desc2 !== '') || (desc1 !== ''))) {
        let keywordPass = false;
        let genenamePass = false;
        let lines = diffKeywordFilter.split("\n");
        for (let k in lines) {
          if (checkboxDiffKeywordFilter === false) {
            if (desc1.toUpperCase().includes(lines[k].toUpperCase()) ||
                desc2.toUpperCase().includes(lines[k].toUpperCase())) {
              keywordPass = true; } }
          else {
            if (desc1.includes(lines[k]) ||
                desc2.includes(lines[k])) {
              keywordPass = true; } } }

        if (diffGeneNameFilter === '') { genenamePass = true; }
        else {
          lines = diffGeneNameFilter.split("\n");
          for (let k in lines) {
            if (checkboxDiffGeneNameSubstring === true) {	// substring search
              if (checkboxDiffGeneNameFilter === false) {	// not case sensitive
                if (name1.toUpperCase().includes(lines[k].toUpperCase())) {
                  genenamePass = true; } }
              else {							// case sensitive
                if (name1.includes(lines[k])) {
                  genenamePass = true; } } }
            else {
              if (checkboxDiffGeneNameFilter === false) {	// exact match
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

    setTextDivDiffResults(textDivDiffResults.concat("Count of differences in description: " + countDifferencesInDescription + "\n\n"));

    setRowsTableDiff(tempRowsTableDiff);
// this doesn't work, it tells the execution time before the requests return and process
    let t1 = Date.now();
  } // processDataCompare(response1, response2)

  const reloadPage = () => {
    window.location.reload();
  }

  const handleInputChangeCheckboxDiffFields = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    let checkboxDiffFieldsValue = props.diffFields;
    let checkboxFieldName = name.replace("checkbox_", "");
    let lowercaseCheckboxFieldName = checkboxFieldName.toLowerCase();
    checkboxDiffFieldsValue[lowercaseCheckboxFieldName] = value;
    props.setDiffFields(checkboxDiffFieldsValue);
  }


  const diffFields = {};
  diffFields['description'] = "Description (Full)";
  diffFields['do_description'] = "DO Description";
  diffFields['go_description'] = "GO Description";
  diffFields['orthology_description'] = "Orthology Description";
  diffFields['tissue_expression_description'] = "Expression Description";
  return (
      <form>
        <div style={{display: showDivTopArrowButton ? 'block' : 'none', position: 'fixed', top: 25, right: 75}}><span style={{color: 'lime', fontSize: 30}} onClick={handleClickTopArrowButton}>&#8593;</span></div>
        <div style={{display: showDivMenuButton2A ? 'block' : 'none', position: 'fixed', top: 25, right: 25}}><span style={{color: 'lime', fontSize: 30}} onClick={handleClickButton2A}>&#9776;</span></div>
        <div style={{display: showDivMenuButton2C ? 'block' : 'none', position: 'fixed', top: 25, right: 25}}><span style={{color: 'lime', fontSize: 30}} onClick={handleClickButton2C}>&#9776;</span></div>

        <ModSelector/>

        <div id='div_section_select'>
          <label>
            <table name="table_section_select" id="table_section_select">
              <tbody name="tbody_section_select" id="tbody_section_select">
              <tr>
                <td style={{padding:"14px", background: backgroundDiffTab}} onClick={handleClickShowSectionDiff}><span>Compare Files</span></td>
                <td style={{padding:"14px", background: backgroundDownloadTab}} onClick={handleClickShowSectionDownload}><span>Download File</span></td>
                <td style={{padding:"14px", background: backgroundLoadTab}} onClick={handleClickShowSectionView}><span>View File</span></td>
              </tr>
              </tbody>
            </table>
          </label>
        </div>

        <div id='div_section_diff' style={{display: showDivDiffSection ? 'block' : 'none'}}>
          <h3 id='anchor2Aresult'>Compare Files</h3>

          <div id='div_diff_loading' style={{display: showDivDiffLoading ? 'block' : 'none', fontSize: 24}}>LOADING<img alt="image_LOADING" width="50" height="50" src="http://tazendra.caltech.edu/~azurebrd/cgi-bin/testing/amigo/loading.gif"/><br/><br/>
          </div>
          <div id='div_diff_result' style={{display: showDivDiffResult ? 'block' : 'none'}}>
            <label>
              General Stats:
              <table
                  name="table_diff_stats"
                  id="table_diff_stats" >
                <thead>
                <tr>
                  <th>field</th>
                  <th id="header_stats_date1" name="header_stats_date1">{props.diffFileObj1 ? props.diffFileObj1.uploadDate : ''}</th>
                  <th id="header_stats_date2" name="header_stats_date2">{props.diffFileObj2 ? props.diffFileObj2.uploadDate : ''}</th>
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
            </label>
            <br />
            <label>
              <div
                  name="div_diff_results_text"
                  id="div_diff_results_text"
                  style={{whiteSpace: 'pre-line'}}
              >
                {textDivDiffResults}
              </div>
            </label>
            <label>
              <table
                  name="table_diff"
                  id="table_diff" >
                <thead>
                <tr>
                  <th>gene</th>
                  <th>name</th>
                  <th id="header_diff_date1" name="header_diff_date1">{props.diffFileObj1 ? props.diffFileObj1.uploadDate : ''}</th>
                  <th id="header_diff_date2" name="header_diff_date2">{props.diffFileObj2 ? props.diffFileObj2.uploadDate : ''}</th>
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
            </label>
            <br />
          </div>

          <table id='anchor2Acontrol'>
            <tbody id="table_compare_body" name="table_compare_body">
            <tr><td style={{verticalAlign: 'top'}}>
              <label>
                Select old file:<br/>
                <select name="date1" id="date1" size={props.descriptionFileObjects.length} onChange={(event) => props.setDescriptionFileForDiff(JSON.parse(event.target.value), 0)}>
                  {props.descriptionFileObjects.map(fileObj =>
                      <option
                          key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                          value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                      </option>)}
                </select>
              </label>
            </td><td style={{verticalAlign: 'top'}}>
              <label>
                Select new file:<br/>
                <select name="date2" id="date2" size={props.descriptionFileObjects.length} onChange={(event) => props.setDescriptionFileForDiff(JSON.parse(event.target.value), 1)}>
                  {props.descriptionFileObjects.map(fileObj =>
                      <option
                          key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                          value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                      </option>)}
                </select>
              </label>
            </td><td style={{verticalAlign: 'top'}}>
              <label>
                Select field to compare:<br/>
                <select name="diffField" id="diffField" size={Object.keys(diffFields).length}
                        onChange={(e) => setDiffField(e.target.value)}>
                  {Object.values(diffFields).map((diffField) => <option key={diffField} value={diffField}>{diffField}</option>)}
                </select>
              </label>
            </td></tr>
            </tbody>
          </table>
          <input type="button" value="Compare files" onClick={handleSubmitCompare}/>
          <input type="button" value="Start Over" onClick={() => reloadPage()} />
          <br/><br/>

          <label>
            Optional gene name filter:<br/>
            <textarea
                name="diffGeneNameFilter"
                id="diffGeneNameFilter"
                type="text"
                size="100"
                value={diffGeneNameFilter}
                onChange={(e) => setDiffGeneNameFilter(e.target.value)} /><br/>
            <input
                name="checkboxDiffGeneNameFilter"
                type="checkbox"
                checked={checkboxDiffGeneNameFilter}
                onChange={(e) => setCheckboxDiffGeneNameFilter(e.target.checked)} />
            Case sensitive<br/>
            <input
                name="checkboxDiffGeneNameSubstring"
                type="checkbox"
                checked={checkboxDiffGeneNameSubstring}
                onChange={(e) => setCheckboxDiffGeneNameSubstring(e.target.checked)} />
            Substring Match<br/>
          </label>
          <br />
          <label>
            Optional phrase filter:<br/>
            <textarea
                name="diffKeywordFilter"
                id="diffKeywordFilter"
                type="text"
                size="100"
                value={diffKeywordFilter}
                onChange={(e) => setDiffKeywordFilter(e.target.value)} /><br/>
            <input
                name="checkboxDiffKeywordFilter"
                type="checkbox"
                checked={checkboxDiffKeywordFilter}
                onChange={(e) => setCheckboxDiffKeywordFilter(e.target.value)} />
            Case sensitive<br/>
          </label>
          <br /><br/>
        </div>

        <div id='div_section_download' style={{display: showDivDownloadSection ? 'block' : 'none'}}>
          <h3>Download a file</h3>
          <label id='anchor2Bcontrol'>
            Select file to download:<br/>
            <select name="dateDownload" id="dateDownload" size={props.descriptionFileObjects.length} onChange={(event) => props.setDescriptionFileForDiff(JSON.parse(event.target.value), 0)}>
              {props.descriptionFileObjects.map(fileObj =>
                  <option
                      key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                      value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                  </option>)}
            </select>
          </label>
          <br />
          {/*
Doesn't work cross origin (across domains)
        <a id="hrefDownload" href="http://www.google.com" download="file.txt" style={{textDecoration: 'none'}}><input type="button" value="Download File"/></a>
*/}
          <input type="button" value="Open JSON in new tab" onClick={handleSubmitOpenTab}/> After it loads, you can save it.<br/>
          <input type="button" value="Generate JSON link" onClick={handleSubmitGenerateLink}/> You can right-click and save it, instead of waiting for it to load.<br/><br/>
          <label>
            <div
                style={{display: showDownloadLink ? 'block' : 'none'}}
                name="div_link_to_json"
                id="div_link_to_json" >
              <a target='_blank' href={downloadLinkUrl} style={{textDecoration: 'none'}}>{downloadLinkText}</a>
            </div>
          </label>
        </div>


        <div id='div_section_load' style={{display: showDivLoadSection ? 'block' : 'none'}}>
          <h3 id='anchor2Cresult'>View a file</h3>

          <div id='div_load_loading' style={{display: showDivLoadLoading ? 'block' : 'none', fontSize: 24}}>LOADING<img alt="image_LOADING" width="50" height="50" src="http://tazendra.caltech.edu/~azurebrd/cgi-bin/testing/amigo/loading.gif"/><br/><br/>
          </div>
          <div id='div_load_result' style={{display: showDivLoadResult ? 'block' : 'none'}}>
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
            {Object.values(diffFields).map(function(item){
//             let name = 'matchcount_' + item;

              if (showLabelFieldsMatchCount !== undefined) {
              let label_key = 'label_key_matchcount_' + item;
              return (
                  <label key={label_key} style={{display: showLabelFieldsMatchCount[item] ? 'block' : 'none'}}>
                    {item} count: {loadFieldsMatchCount[item]}<br/>
                  </label>
              )}}, this)}
            <br />

            <label>
              File Load Result:<br/>
              <input type="button" value="Previous Page" onClick={handleSubmitLoadPrevPage}/>
              &nbsp;&nbsp;Page {pageNumber}&nbsp;&nbsp;
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
              &nbsp;&nbsp;Page {pageNumber}&nbsp;&nbsp;
              <input type="button" value="Next Page" onClick={handleSubmitLoadNextPage}/><br/>
              <br/>
            </label>
          </div>

          <label id='anchor2Ccontrol'>
            Select file to view:<br/>
            <select name="dateLoad" id="dateLoad" size={props.descriptionFileObjects.length} onChange={(event) => props.setDescriptionFileForDiff(JSON.parse(event.target.value), 0)}>
              {props.descriptionFileObjects.map(fileObj =>
                  <option
                      key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                      value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                  </option>)}
            </select>
          </label>
          <br />
          <input type="button" value="Load JSON" onClick={handleSubmitLoad}/><br/>
          <br />
          <label>
            Which fields to display : <br />
          </label>
          {Object.keys(diffFields).map(function(item){
            let name = 'checkbox_' + item;
            let label_key = 'label_key_' + item;
            return (
                <label key={label_key}>
                  <input
                      name={name}
                      type="checkbox"
                      checked={props.diffFields[item]}
                      onChange={handleInputChangeCheckboxDiffFields}
                  />{diffFields[item]}<br/>
                </label>
            )}, this)}
          <br />
          <label>
            Which type of results to show : <br />
          </label>
          <label>
            <input
                name="checkboxHasData"
                type="checkbox"
                checked={checkboxHasData}
                onChange={(e) => setCheckboxHasData(e.target.checked)} />
            Has Data<br/>
          </label>
          <label>
            <input
                name="checkboxHasNoData"
                type="checkbox"
                checked={!checkboxHasData}
                onChange={(e) => setCheckboxHasData(e.target.checked)} />
            Does not have Data<br/>
          </label>
          <br />
          <label>
            Entries per page :
            <input
                name="entriesPerPage"
                id="entriesPerPage"
                type="number"
                size="5"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(e.target.value)} />
          </label>
          <br />
          <label>
            Page number :
            <input
                name="pageNumber"
                id="pageNumber"
                type="number"
                size="5"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)} />
          </label>
          <br />
          <br />
          <label>
            Optional gene name filter:<br/>
            <textarea
                name="loadGeneNameFilter"
                id="loadGeneNameFilter"
                type="text"
                size="100"
                value={loadGeneNameFilter}
                onChange={(e) => setLoadGeneNameFilter(e.target.value)} /><br/>
            <input
                name="checkboxLoadGeneNameFilter"
                type="checkbox"
                checked={checkboxLoadGeneNameFilter}
                onChange={(e) => setCheckboxLoadGeneNameFilter(e.target.checked)} />
            Case sensitive<br/>
            <input
                name="checkboxLoadGeneNameSubstring"
                type="checkbox"
                checked={checkboxLoadGeneNameSubstring}
                onChange={(e) => setCheckboxLoadGeneNameSubstring(e.target.value)} />
            Substring Match<br/>
          </label>
          <br />
          <label>
            Optional phrase filter:<br/>
            <textarea
                name="loadKeywordFilter"
                id="loadKeywordFilter"
                type="text"
                size="100"
                value={loadKeywordFilter}
                onChange={(e) => setLoadKeywordFilter(e.target.value)} /><br/>
            <input
                name="checkboxLoadKeywordFilter"
                type="checkbox"
                checked={checkboxLoadKeywordFilter}
                onChange={(e) => setCheckboxLoadKeywordFilter(e.target.checked)} />
            Case sensitive<br/>
          </label>
          <br />
          <label>
            Optional ontology ID filter:<br/>
            <textarea
                name="loadOntologyFilter"
                id="loadOntologyFilter"
                type="text"
                size="100"
                value={loadOntologyFilter}
                onChange={(e) => setLoadOntologyFilter(e.target.value)} /><br/>
          </label>
          <br />
          <label>
            Count of set_final_experimental_go_ids
            <select name="loadComparisonGoids" id="loadComparisonGoids" size="1" value={loadComparisonGoids}
                    onChange={(e) => setLoadComparisonGoids(e.target.value)}>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="==">==</option>
            </select>
            <input
                name="loadGoidsCount"
                id="loadGoidsCount"
                type="number"
                size="5"
                value={loadGoidsCount}
                onChange={(e) => setLoadGoidsCount(e.target.value)} />
          </label>
          <br />
        </div>

      </form>
    );
}

const mapStateToProps = state => ({
  selectedMod: getSelectedMod(state),
  latestFilesOnly: getLatestFilesOnly(state),
  diffFields: getDiffFields(state),
  descriptionFileObjects: getDescriptionFileObjects(state),
  diffFileObj1: getDiffFileObjs(state)[0],
  diffFileObj2: getDiffFileObjs(state)[1],
});

export default connect(mapStateToProps, {setModsList, setDiffFields, fetchModsList, fetchFilesFromFMS,
  setDescriptionFileForDiff})(ReportTool)