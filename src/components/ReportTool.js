import { connect } from 'react-redux'
import '../index.css';
import pako from 'pako';
import axios from 'axios';
import {generateFmsJsonUrl, getHtmlVar} from "../lib";
import React from 'react';
import ModSelector from "./ModSelector";
import {fetchFilesFromFMS, fetchModsList, setDiffFields, setModsList} from "../redux/actions";
import {getDescriptionFileObjects, getDiffFields, getLatestFilesOnly, getSelectedMod} from "../redux/selectors";


class ReportTool extends React.Component {
  constructor(props) {
    super(props);
    let queryMod = getHtmlVar().get('mod');
    if (queryMod != null) {
      console.log('constructor queryMod ' + queryMod);
      this.props.setSelectedMod(queryMod);
    }

    this.state = {
      showDownloadLink: false,
      downloadLinkText: 'linkText',
      downloadLinkUrl: 'http://tazendra.caltech.edu/~azurebrd/cgi-bin/forms/agr/data/',
      releaseVersions: {},
      numReleaseVersions: 0,
      numVersionsFetched: 0,
      s3FilePaths: [],
      rowsTableLoad: [],
      rowsTableLoadStats: [],
      rowsTableDiff: [],
      rowsTableDiffStats: [],
      showDivTopArrowButton: false,
      showDivMenuButton2A: false,
      showDivMenuButton2C: false,
      backgroundDiffTab: 'white',
      backgroundDownloadTab: 'white',
      backgroundLoadTab: 'white',
      showDivDiffSection: false,
      showDivDownloadSection: false,
      showDivLoadSection: true,
      showDivDiffLoading: false,
      showDivLoadLoading: false,
      showDivLoadResult: false,
      showDivDiffResult: false,
      showDivDiffNavigation: false,
      textDivDiffResults: '',
      headerStatsDate1: 'date1',
      headerStatsDate2: 'date2',
      headerDiffDate1: 'date1',
      headerDiffDate2: 'date2',
      diffKeywordFilter: '',
      diffGeneNameFilter: '',
      loadOntologyFilter: '',
      loadKeywordFilter: '',
      loadGeneNameFilter: '',
      checkboxDiffKeywordFilter: false,
      checkboxDiffGeneNameFilter: false,
      checkboxDiffGeneNameSubstring: false,
      checkboxLoadKeywordFilter: false,
      checkboxLoadGeneNameFilter: false,
      checkboxLoadGeneNameSubstring: false,
      entriesPerPage: 100,
      pageNumber: 1,
      loadComparisonGoids: '>=',
      loadGoidsCount: 0,
      diffField: undefined,
      loadFieldsMatchCount: [],
      showLabelFieldsMatchCount: [],
      checkboxDescription: true,
      checkboxDoDescription: true,
      checkboxGoDescription: true,
      checkboxOrthologyDescription: true,
      checkboxHasData: true,
      checkboxHasNoData: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputChangeCheckboxDiffFields = this.handleInputChangeCheckboxDiffFields.bind(this);
    this.handleClickShowSectionDiff = this.handleClickShowSectionDiff.bind(this);
    this.handleClickShowSectionDownload = this.handleClickShowSectionDownload.bind(this);
    this.handleClickShowSectionView = this.handleClickShowSectionView.bind(this);
    this.handleClickTopArrowButton = this.handleClickTopArrowButton.bind(this);
    this.handleClickButton2A = this.handleClickButton2A.bind(this);
    this.handleClickButton2C = this.handleClickButton2C.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleSubmitCompare = this.handleSubmitCompare.bind(this);
    this.handleSubmitOpenTab = this.handleSubmitOpenTab.bind(this);
    this.handleSubmitGenerateLink = this.handleSubmitGenerateLink.bind(this);
    this.handleSubmitLoad = this.handleSubmitLoad.bind(this);
    this.handleSubmitLoadNextPage = this.handleSubmitLoadNextPage.bind(this);
    this.handleSubmitLoadPrevPage = this.handleSubmitLoadPrevPage.bind(this);
    this.processSubmitLoadAction = this.processSubmitLoadAction.bind(this);
  }

  componentDidMount() {
    if (this.props.selectedMod !== undefined) {
      this.props.fetchFilesFromFMS(this.props.latestFilesOnly, this.props.selectedMod);
    }
    this.props.fetchModsList();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.selectedMod !== this.props.selectedMod || prevProps.latestFilesOnly !== this.props.latestFilesOnly) {
      this.props.fetchFilesFromFMS(this.props.latestFilesOnly, this.props.selectedMod);
    }
  }

  handleChange(event) {
    const target = event.target;
    const name = target.name;
    console.log('handleChange set ' + name + ' value ' + event.target.value);
    this.setState({
      [name]: event.target.value
    });
  }

  handleChangePage(event) {
    this.handleChange(event);
    console.log('page ' + this.state.pageNumber + ' entriesPerPage ' + this.state.entriesPerPage);
  }

  requestAndGunzipBodyIfNecessary(url) {
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

  processSubmitLoadAction() {
    this.setState({showDivDiffResult: false});
    this.setState({showDivTopArrowButton: false});
    this.setState({showDivMenuButton2A: false});
    this.setState({showDivMenuButton2C: false});
    let errorMessage = '';
    if (this.state.descriptionFileObj1 === undefined) { errorMessage += 'Choose a file\n';  }
    if (this.props.selectedMod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let urlLoad = generateFmsJsonUrl(this.state.descriptionFileObj1.s3Path, this.props.selectedMod);
    console.log('load date ' + this.state.descriptionFileObj1.uploadDate + ' version ' + this.state.descriptionFileObj1.releaseVersion + ' releaseLoad ' + this.state.descriptionFileObj1.releaseType);
    console.log('download ' + urlLoad);
    this.setState({showDivMenuButton2C: true});
    this.setState({showDivTopArrowButton: true});
    var element = document.getElementById("anchor2Cresult");
    element.scrollIntoView();
    this.setState({showDivLoadLoading: true});

    this.requestAndGunzipBodyIfNecessary(urlLoad).then(res => this.processDataLoad(res));

  } // processSubmitLoadAction()

  processDataLoad(response) {
    let tempRowsTableLoad = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
    let tempRowsTableStats = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
    this.setState({ rowsTableLoad: [] });
    this.setState({showDivLoadResult: true});
    this.setState({showDivLoadLoading: false});
    let skipCount = (this.state.pageNumber - 1) * this.state.entriesPerPage - 1;
    let doneCount = this.state.pageNumber * this.state.entriesPerPage - 1;
    let matchCount = 0;
    let fieldsMatchCount = [];
    let showFieldsMatchCount = [];
    Object.keys(this.props.diffFields).forEach(diffField => {
      showFieldsMatchCount[diffField] = this.props.diffFields[diffField] === true;
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
    this.setState({
      rowsTableLoadStats: tempRowsTableStats
    });

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

      if ( ( (this.state.loadComparisonGoids === '>=') &&
          (count_set_final_go_ids >= this.state.loadGoidsCount) )
          || ( (this.state.loadComparisonGoids === '<=') &&
              (count_set_final_go_ids <= this.state.loadGoidsCount) )
          || ( (this.state.loadComparisonGoids === '==') &&
              (count_set_final_go_ids === this.state.loadGoidsCount) ) ) {

        Object.keys(this.props.diffFields).forEach(diffField => {
          let diffFieldValue = response.data[i][diffField] || '';
          if (this.props.diffFields[diffField] === true) {
            if ( ( ( this.state.checkboxHasData ) && (diffFieldValue !== '') ) ||
                ( ( this.state.checkboxHasNoData ) && (diffFieldValue === '') ) ) {
              let keywordPass = false;
              let genenamePass = false;
              let ontologyPass = false;
              if (this.state.loadKeywordFilter === '') { keywordPass = true; }
              else {
                let lines = this.state.loadKeywordFilter.split("\n");
                for (let k in lines) {
                  if (this.state.checkboxLoadKeywordFilter === false) {
                    if (diffFieldValue.toUpperCase().includes(lines[k].toUpperCase())) {
                      keywordPass = true; } }
                  else {
                    if (diffFieldValue.includes(lines[k])) {
                      keywordPass = true; } } } }
              if (this.state.loadGeneNameFilter === '') { genenamePass = true; }
              else {
                let lines = this.state.loadGeneNameFilter.split("\n");
                for (let k in lines) {
                  if (this.state.checkboxLoadGeneNameSubstring === true) {	// substring search
                    if (this.state.checkboxLoadGeneNameFilter === false) {	// not case sensitive
                      if (gene_name.toUpperCase().includes(lines[k].toUpperCase())) {
                        genenamePass = true; } }
                    else {							// case sensitive
                      if (gene_name.includes(lines[k])) {
                        genenamePass = true; } } }
                  else {							// exact match search
                    if (this.state.checkboxLoadGeneNameFilter === false) {	// not case sensitive
                      if (gene_name.toUpperCase() === lines[k].toUpperCase()) {
                        genenamePass = true; } }
                    else {							// case sensitive
                      if (gene_name === lines[k]) {
                        genenamePass = true; } } } } }
              if (this.state.loadOntologyFilter === '') { ontologyPass = true; }
              else {
                let lines = this.state.loadOntologyFilter.split("\n");
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
//                         loadFieldsMatchCount: [],
//               if (matchCount > doneCount) { break; }			// to process entries only until desired amount, Ranjana wants to always process everything to get counts
      }
    }
    this.setState({ rowsTableLoad: tempRowsTableLoad });
    this.setState({ loadFieldsMatchCount: fieldsMatchCount });
    this.setState({ showLabelFieldsMatchCount: showFieldsMatchCount });
  } // processDataLoad()

  handleSubmitLoadNextPage(event) {
    event.preventDefault();
    console.log('next page');
    let nextPage = this.state.pageNumber + 1;
    this.setState({pageNumber: nextPage});
    this.processSubmitLoadAction();
  }

  handleSubmitLoadPrevPage(event) {
    event.preventDefault();
    console.log('prev page');
    let prevPage = this.state.pageNumber - 1;
    if (prevPage < 1) { prevPage = 1; }
    this.setState({pageNumber: prevPage});
    this.processSubmitLoadAction();
  }

  handleSubmitLoad(event) {
    event.preventDefault();
    console.log('submit ' + event.target.value);
    this.processSubmitLoadAction();
  }


  handleSubmitGenerateLink(event) {
    event.preventDefault();
    console.log('submit ' + event.target.value);
    let errorMessage = '';
    if (this.state.descriptionFileObj1 === undefined) { errorMessage += 'Choose a file\n';  }
    if (this.props.selectedMod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let urlDownload = generateFmsJsonUrl(this.state.descriptionFileObj1.s3Path, this.props.selectedMod);
    console.log('download date ' + this.state.descriptionFileObj1.uploadDate + ' version ' + this.state.descriptionFileObj1.releaseVersion + ' releaseDownload ' + this.state.descriptionFileObj1.releaseType);

    let filename = this.state.descriptionFileObj1.uploadDate + '_' + this.props.selectedMod + '.json';
    let downloadLink = document.createElement("a");
    downloadLink.setAttribute( 'href', urlDownload );
    downloadLink.setAttribute( 'target', '_blank' );
    downloadLink.setAttribute( 'download', filename );
    let downloadText = 'download ' + filename;
    downloadLink.innerHTML = downloadText;
    this.setState({downloadLinkUrl: urlDownload});

    downloadText = urlDownload;

    this.setState({downloadLinkText: downloadText});
    this.setState({showDownloadLink: true});
  }

  handleSubmitOpenTab(event) {
    event.preventDefault();
    console.log('submit ' + event.target.value);
    let errorMessage = '';
    if (this.state.descriptionFileObj1 === undefined) { errorMessage += 'Choose a file\n';  }
    if (this.props.selectedMod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let urlDownload = generateFmsJsonUrl(this.state.descriptionFileObj1.s3Path, this.props.selectedMod);
    console.log('download date ' + this.state.descriptionFileObj1.uploadDate + ' version ' + this.state.descriptionFileObj1.releaseVersion + ' releaseDownload ' + this.state.descriptionFileObj1.releaseType);
    window.open(urlDownload);
  }

  handleClickShowSectionDiff(event) {
    console.log('click ' + event.target.value);
    this.setState({showDivDiffSection: true});
    this.setState({showDivDownloadSection: false});
    this.setState({showDivLoadSection: false});
    this.setState({backgroundDiffTab: '#ddd'});
    this.setState({backgroundDownloadTab: 'white'});
    this.setState({backgroundLoadTab: 'white'});
    event.preventDefault();
  }

  handleClickShowSectionDownload(event) {
    console.log('click ' + event.target.value);
    this.setState({showDivDiffSection: false});
    this.setState({showDivDownloadSection: true});
    this.setState({showDivLoadSection: false});
    this.setState({backgroundDiffTab: 'white'});
    this.setState({backgroundDownloadTab: '#ddd'});
    this.setState({backgroundLoadTab: 'white'});
    event.preventDefault();
  }

  handleClickShowSectionView(event) {
    console.log('click ' + event.target.value);
    this.setState({showDivDiffSection: false});
    this.setState({showDivDownloadSection: false});
    this.setState({showDivLoadSection: true});
    this.setState({backgroundDiffTab: 'white'});
    this.setState({backgroundDownloadTab: 'white'});
    this.setState({backgroundLoadTab: '#ddd'});
    event.preventDefault();
  }

  handleClickTopArrowButton(event) {
    console.log('click ' + event.target.value);
    var element = document.getElementById("div_section_mod");
    element.scrollIntoView();
    this.setState({showDivDiffResult: false});
    this.setState({showDivLoadResult: false});
    event.preventDefault();
  }

  handleClickButton2A(event) {
    console.log('click ' + event.target.value);
    var element = document.getElementById("anchor2Acontrol");
    element.scrollIntoView();
    event.preventDefault();
  }

  handleClickButton2C(event) {
    console.log('click ' + event.target.value);
    var element = document.getElementById("anchor2Ccontrol");
    element.scrollIntoView();
    event.preventDefault();
  }

  handleSubmitCompare(event) {
    let t0 = Date.now();
    console.log('submit ' + event.target.value);
    event.preventDefault();
    let errorMessage = '';
    if (this.state.descriptionFileObj1 === undefined) {     errorMessage += 'Choose an old file\n';         }
    if (this.state.descriptionFileObj2 === undefined) {     errorMessage += 'Choose a new file\n';          }
    if (this.state.diffField === undefined) { errorMessage += 'Choose a field to compare\n';  }
    if (this.props.selectedMod === undefined) {       errorMessage += 'Choose a mod\n';               }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let url1 = generateFmsJsonUrl(this.state.descriptionFileObj1.s3Path, this.props.selectedMod);
    console.log('diff 1 date ' + this.state.descriptionFileObj1.uploadDate + ' version ' + this.state.descriptionFileObj1.releaseVersion + ' release1 ' + this.state.descriptionFileObj1.releaseType);
    let url2 = generateFmsJsonUrl(this.state.descriptionFileObj2.s3Path, this.props.selectedMod);
    console.log('diff 2 date ' + this.state.descriptionFileObj2.uploadDate + ' version ' + this.state.descriptionFileObj2.releaseVersion + ' release1 ' + this.state.descriptionFileObj2.releaseType);
    this.setState({headerStatsDate1: this.state.descriptionFileObj1.uploadDate});
    this.setState({headerStatsDate2: this.state.descriptionFileObj2.uploadDate});
    this.setState({headerDiffDate1: this.state.descriptionFileObj1.uploadDate});
    this.setState({headerDiffDate2: this.state.descriptionFileObj2.uploadDate});
    this.setState({showDivDiffLoading: true});
    this.setState({showDivDiffNavigation: true});
    this.setState({showDivMenuButton2A: true});
    this.setState({showDivMenuButton2C: false});
    this.setState({showDivTopArrowButton: true});
    this.setState({showDivLoadResult: false});
    var element = document.getElementById("anchor2Aresult");
    element.scrollIntoView();

    this.requestAndGunzipBodyIfNecessary(url1).then((res1) => {
      this.requestAndGunzipBodyIfNecessary(url2).then((res2) => {
        this.processDataCompare(res1, res2, t0);
      })
    });

  } // handleSubmitCompare(event)


  processDataCompare(response1, response2, t0) {
    let tempRowsTableDiff = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
    let tempRowsTableStats = [];	// don't want to add each row one at a time and render it, add to this array and update all table rows at once
    this.setState({showDivDiffResult: true});
    this.setState({showDivDiffLoading: false});
    this.setState({ rowsTableDiffStats: [] });
    this.setState({ rowsTableDiff: [] });

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
    this.setState({
      rowsTableDiffStats: tempRowsTableStats
    });

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

    this.setState({textDivDiffResults: ""});
    let createdGenes = {};
    createdGenes['text'] = [];
    createdGenes['null'] = [];
    for (let gene in maps.file2) {
      if (maps['file1'][gene] === undefined) {
        let index2 = maps['file2'][gene]['index'];
        let desc2 = response2['data'][index2][this.state.diffField];
        if (desc2 === null || desc2 === undefined) { createdGenes['null'].push(gene); }
        else { createdGenes['text'].push(gene); } } }
    let createdGenesText = 'None';
    let createdGenesNull = 'None';
    if (!(createdGenes['text'] === undefined || createdGenes['text'].length === 0)) {
      createdGenesText = createdGenes['text'].join(', '); }
    if (!(createdGenes['null'] === undefined || createdGenes['null'].length === 0)) {
      createdGenesNull = createdGenes['null'].join(', '); }
    this.setState({textDivDiffResults: this.state.textDivDiffResults.concat("Created Genes with Text in description:\n" + createdGenesText + "\n\n")});
    this.setState({textDivDiffResults: this.state.textDivDiffResults.concat("Created Genes with Null in description:\n" + createdGenesNull + "\n\n")});

    let removedGenes = {};
    removedGenes['text'] = [];
    removedGenes['null'] = [];
    for (let gene in maps.file1) {
      if (maps['file2'][gene] === undefined) {
        let index1 = maps['file1'][gene]['index'];
        let desc1 = response1['data'][index1][this.state.diffField];
        if (desc1 === null || desc1 === undefined) { removedGenes['null'].push(gene); }
        else { removedGenes['text'].push(gene); } } }
    let removedGenesText = 'None';
    let removedGenesNull = 'None';
    if (!(removedGenes['text'] === undefined || removedGenes['text'].length === 0)) {
      removedGenesText = removedGenes['text'].join(', '); }
    if (!(removedGenes['null'] === undefined || removedGenes['null'].length === 0)) {
      removedGenesNull = removedGenes['null'].join(', '); }
    this.setState({textDivDiffResults: this.state.textDivDiffResults.concat("Removed Genes with Text in description:\n" + removedGenesText + "\n\n")});
    this.setState({textDivDiffResults: this.state.textDivDiffResults.concat("Removed Genes with Null in description:\n" + removedGenesNull + "\n\n")});

    if (this.state.diffKeywordFilter !== '') {
      this.setState({textDivDiffResults: this.state.textDivDiffResults.concat("Filtering on keyword " + this.state.diffKeywordFilter + "\n\n")});
    }
    else {
      this.setState({textDivDiffResults: this.state.textDivDiffResults.concat("Not filtering on a keyword\n\n")});
    }

    let countDifferencesInDescription = 0;
    for (let gene in maps.file1) {
      let index1 = maps['file1'][gene]['index'];
      let name1 = response1['data'][index1]['gene_name'];
      let desc1 = '';
      let desc2 = '';
      if (response1['data'][index1][this.state.diffField] !== undefined) {
        if (response1['data'][index1][this.state.diffField] !== null) {
          desc1 = response1['data'][index1][this.state.diffField]; } }
      if (!(maps['file2'][gene] === undefined)) {
        let index2 = maps['file2'][gene]['index'];
        if (response2['data'][index2][this.state.diffField] !== undefined) {
          if (response2['data'][index2][this.state.diffField] !== null) {
            desc2 = response2['data'][index2][this.state.diffField]; } } }

      if ((desc1 !== desc2) && ((desc2 !== '') || (desc1 !== ''))) {
        let keywordPass = false;
        let genenamePass = false;
        let lines = this.state.diffKeywordFilter.split("\n");
        for (let k in lines) {
          if (this.state.checkboxDiffKeywordFilter === false) {
            if (desc1.toUpperCase().includes(lines[k].toUpperCase()) ||
                desc2.toUpperCase().includes(lines[k].toUpperCase())) {
              keywordPass = true; } }
          else {
            if (desc1.includes(lines[k]) ||
                desc2.includes(lines[k])) {
              keywordPass = true; } } }

        if (this.state.diffGeneNameFilter === '') { genenamePass = true; }
        else {
          lines = this.state.diffGeneNameFilter.split("\n");
          for (let k in lines) {
            if (this.state.checkboxDiffGeneNameSubstring === true) {	// substring search
              if (this.state.checkboxDiffGeneNameFilter === false) {	// not case sensitive
                if (name1.toUpperCase().includes(lines[k].toUpperCase())) {
                  genenamePass = true; } }
              else {							// case sensitive
                if (name1.includes(lines[k])) {
                  genenamePass = true; } } }
            else {
              if (this.state.checkboxDiffGeneNameFilter === false) {	// exact match
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

    this.setState({textDivDiffResults: this.state.textDivDiffResults.concat("Count of differences in description: " + countDifferencesInDescription + "\n\n")});

    this.setState({
      rowsTableDiff: tempRowsTableDiff
    });
// this doesn't work, it tells the execution time before the requests return and process
    let t1 = Date.now();
    console.log('Render took', t1-t0, 'ms');
  } // processDataCompare(response1, response2)

  reloadPage() {
    window.location.reload();
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleInputChangeCheckboxDiffFields(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    let checkboxDiffFieldsValue = this.props.diffFields;
    let checkboxFieldName = name.replace("checkbox_", "");
    let lowercaseCheckboxFieldName = checkboxFieldName.toLowerCase();
    checkboxDiffFieldsValue[lowercaseCheckboxFieldName] = value;
    this.props.setDiffFields(checkboxDiffFieldsValue);
  }


  render() {
    const diffFields = {};
    diffFields['description'] = "Description (Full)";
    diffFields['do_description'] = "DO Description";
    diffFields['go_description'] = "GO Description";
    diffFields['orthology_description'] = "Orthology Description";
    diffFields['tissue_expression_description'] = "Expression Description";
    return (
        <form>
          <div style={{display: this.state.showDivTopArrowButton ? 'block' : 'none', position: 'fixed', top: 25, right: 75}}><span style={{color: 'lime', fontSize: 30}} onClick={this.handleClickTopArrowButton}>&#8593;</span></div>
          <div style={{display: this.state.showDivMenuButton2A ? 'block' : 'none', position: 'fixed', top: 25, right: 25}}><span style={{color: 'lime', fontSize: 30}} onClick={this.handleClickButton2A}>&#9776;</span></div>
          <div style={{display: this.state.showDivMenuButton2C ? 'block' : 'none', position: 'fixed', top: 25, right: 25}}><span style={{color: 'lime', fontSize: 30}} onClick={this.handleClickButton2C}>&#9776;</span></div>

          <ModSelector/>

          <div id='div_section_select'>
            <label>
              <table name="table_section_select" id="table_section_select">
                <tbody name="tbody_section_select" id="tbody_section_select">
                <tr>
                  <td style={{padding:"14px", background: this.state.backgroundDiffTab}} onClick={this.handleClickShowSectionDiff}><span>Compare Files</span></td>
                  <td style={{padding:"14px", background: this.state.backgroundDownloadTab}} onClick={this.handleClickShowSectionDownload}><span>Download File</span></td>
                  <td style={{padding:"14px", background: this.state.backgroundLoadTab}} onClick={this.handleClickShowSectionView}><span>View File</span></td>
                </tr>
                </tbody>
              </table>
            </label>
          </div>

          <div id='div_section_diff' style={{display: this.state.showDivDiffSection ? 'block' : 'none'}}>
            <h3 id='anchor2Aresult'>Compare Files</h3>

            <div id='div_diff_loading' style={{display: this.state.showDivDiffLoading ? 'block' : 'none', fontSize: 24}}>LOADING<img alt="image_LOADING" width="50" height="50" src="http://tazendra.caltech.edu/~azurebrd/cgi-bin/testing/amigo/loading.gif"/><br/><br/>
            </div>
            <div id='div_diff_result' style={{display: this.state.showDivDiffResult ? 'block' : 'none'}}>
              <label>
                General Stats:
                <table
                    name="table_diff_stats"
                    id="table_diff_stats" >
                  <thead>
                  <tr>
                    <th>field</th>
                    <th id="header_stats_date1" name="header_stats_date1">{this.state.headerStatsDate1}</th>
                    <th id="header_stats_date2" name="header_stats_date2">{this.state.headerStatsDate2}</th>
                  </tr>
                  </thead>
                  <tbody id="table_diff_stats_body" name="table_diff_stats_body">
                  {this.state.rowsTableDiffStats.map((item, idx) => (
                      <tr id="addr0" key={idx}>
                        <td>{this.state.rowsTableDiffStats[idx].field}</td>
                        <td>{this.state.rowsTableDiffStats[idx].date1}</td>
                        <td>{this.state.rowsTableDiffStats[idx].date2}</td>
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
                  {this.state.textDivDiffResults}
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
                    <th id="header_diff_date1" name="header_diff_date1">{this.state.headerDiffDate1}</th>
                    <th id="header_diff_date2" name="header_diff_date2">{this.state.headerDiffDate2}</th>
                  </tr>
                  </thead>
                  <tbody id="table_diff_body" name="table_diff_body">
                  {this.state.rowsTableDiff.map((item, idx) => (
                      <tr id="addr0" key={idx}>
                        <td>{this.state.rowsTableDiff[idx].geneid}</td>
                        <td>{this.state.rowsTableDiff[idx].genename}</td>
                        <td>{this.state.rowsTableDiff[idx].desc1}</td>
                        <td>{this.state.rowsTableDiff[idx].desc2}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </label>
              <br />
            </div>
            {/* for when results were at the top of the page and users might need to jump to the controls
        <div id='div_diff_navigation' style={{display: this.state.showDivDiffNavigation ? 'block' : 'none'}}>
          <a href="#mod" style={{textDecoration: 'none'}}><input type="button" value="Edit Query"/></a>
          <input type="button" value="Start Over" onClick={() => this.reloadPage()} /><br/><br/>
        </div>
  */}

            <table id='anchor2Acontrol'>
              <tbody id="table_compare_body" name="table_compare_body">
              <tr><td style={{verticalAlign: 'top'}}>
                <label>
                  Select old file:<br/>
                  <select name="date1" id="date1" size={this.props.descriptionFileObjects.length} onChange={(event) => this.setState({descriptionFileObj1: JSON.parse(event.target.value)})}>
                    {this.props.descriptionFileObjects.map(fileObj =>
                        <option
                            key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                            value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                        </option>)}
                  </select>
                </label>
              </td><td style={{verticalAlign: 'top'}}>
                <label>
                  Select new file:<br/>
                  <select name="date2" id="date2" size={this.props.descriptionFileObjects.length} onChange={(event) => this.setState({descriptionFileObj2: JSON.parse(event.target.value)})}>
                    {this.props.descriptionFileObjects.map(fileObj =>
                        <option
                            key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                            value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                        </option>)}
                  </select>
                </label>
              </td><td style={{verticalAlign: 'top'}}>
                <label>
                  Select field to compare:<br/>
                  <select name="diffField" id="diffField" size={Object.keys(diffFields).length}  onChange={this.handleChange}>
                    {Object.values(diffFields).map((diffField) => <option key={diffField} value={diffField}>{diffField}</option>)}
                  </select>
                </label>
              </td></tr>
              </tbody>
            </table>
            <input type="button" value="Compare files" onClick={this.handleSubmitCompare}/>
            <input type="button" value="Start Over" onClick={() => this.reloadPage()} />
            <br/><br/>

            <label>
              Optional gene name filter:<br/>
              <textarea
                  name="diffGeneNameFilter"
                  id="diffGeneNameFilter"
                  type="text"
                  size="100"
                  value={this.state.diffGeneNameFilter}
                  onChange={this.handleChange} /><br/>
              <input
                  name="checkboxDiffGeneNameFilter"
                  type="checkbox"
                  checked={this.state.checkboxDiffGeneNameFilter}
                  onChange={this.handleInputChange} />
              Case sensitive<br/>
              <input
                  name="checkboxDiffGeneNameSubstring"
                  type="checkbox"
                  checked={this.state.checkboxDiffGeneNameSubstring}
                  onChange={this.handleInputChange} />
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
                  value={this.state.diffKeywordFilter}
                  onChange={this.handleChange} /><br/>
              <input
                  name="checkboxDiffKeywordFilter"
                  type="checkbox"
                  checked={this.state.checkboxDiffKeywordFilter}
                  onChange={this.handleInputChange} />
              Case sensitive<br/>
            </label>
            <br /><br/>
          </div>

          <div id='div_section_download' style={{display: this.state.showDivDownloadSection ? 'block' : 'none'}}>
            <h3>Download a file</h3>
            <label id='anchor2Bcontrol'>
              Select file to download:<br/>
              <select name="dateDownload" id="dateDownload" size={this.props.descriptionFileObjects.length} onChange={(event) => this.setState({descriptionFileObj1: JSON.parse(event.target.value)})}>
                {this.props.descriptionFileObjects.map(fileObj =>
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
            <input type="button" value="Open JSON in new tab" onClick={this.handleSubmitOpenTab}/> After it loads, you can save it.<br/>
            <input type="button" value="Generate JSON link" onClick={this.handleSubmitGenerateLink}/> You can right-click and save it, instead of waiting for it to load.<br/><br/>
            <label>
              <div
                  style={{display: this.state.showDownloadLink ? 'block' : 'none'}}
                  name="div_link_to_json"
                  id="div_link_to_json" >
                <a target='_blank' href={this.state.downloadLinkUrl} style={{textDecoration: 'none'}}>{this.state.downloadLinkText}</a>
              </div>
            </label>
          </div>


          <div id='div_section_load' style={{display: this.state.showDivLoadSection ? 'block' : 'none'}}>
            <h3 id='anchor2Cresult'>View a file</h3>

            <div id='div_load_loading' style={{display: this.state.showDivLoadLoading ? 'block' : 'none', fontSize: 24}}>LOADING<img alt="image_LOADING" width="50" height="50" src="http://tazendra.caltech.edu/~azurebrd/cgi-bin/testing/amigo/loading.gif"/><br/><br/>
            </div>
            <div id='div_load_result' style={{display: this.state.showDivLoadResult ? 'block' : 'none'}}>
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
                  {this.state.rowsTableLoadStats.map((item, idx) => (
                      <tr id="addr0" key={idx}>
                        <td>{this.state.rowsTableLoadStats[idx].field}</td>
                        <td>{this.state.rowsTableLoadStats[idx].value}</td>
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
                let label_key = 'label_key_matchcount_' + item;
                return (
                    <label key={label_key} style={{display: this.state.showLabelFieldsMatchCount[item] ? 'block' : 'none'}}>
                      {item} count: {this.state.loadFieldsMatchCount[item]}<br/>
                    </label>
                )}, this)}
              <br />

              <label>
                File Load Result:<br/>
                <input type="button" value="Previous Page" onClick={this.handleSubmitLoadPrevPage}/>
                &nbsp;&nbsp;Page {this.state.pageNumber}&nbsp;&nbsp;
                <input type="button" value="Next Page" onClick={this.handleSubmitLoadNextPage}/><br/>
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
                  {this.state.rowsTableLoad.map((item, idx) => (
                      <tr id="addr0" key={idx}>
                        <td>{this.state.rowsTableLoad[idx].gene_id}</td>
                        <td>{this.state.rowsTableLoad[idx].gene_name}</td>
                        <td>{this.state.rowsTableLoad[idx].field}</td>
                        <td>{this.state.rowsTableLoad[idx].text}</td>
                      </tr>
                  ))}
                  </tbody>
                </table><br/>
              </label>
              <label>
                <input type="button" value="Previous Page" onClick={this.handleSubmitLoadPrevPage}/>
                &nbsp;&nbsp;Page {this.state.pageNumber}&nbsp;&nbsp;
                <input type="button" value="Next Page" onClick={this.handleSubmitLoadNextPage}/><br/>
                <br/>
              </label>
            </div>

            <label id='anchor2Ccontrol'>
              Select file to view:<br/>
              <select name="dateLoad" id="dateLoad" size={this.props.descriptionFileObjects.length} onChange={(event) => this.setState({descriptionFileObj1: JSON.parse(event.target.value)})}>
                {this.props.descriptionFileObjects.map(fileObj =>
                    <option
                        key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                        value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                    </option>)}
              </select>
            </label>
            <br />
            <input type="button" value="Load JSON" onClick={this.handleSubmitLoad}/><br/>
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
                        checked={this.props.diffFields[item]}
                        onChange={this.handleInputChangeCheckboxDiffFields}
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
                  checked={this.state.checkboxHasData}
                  onChange={this.handleInputChange} />
              Has Data<br/>
            </label>
            <label>
              <input
                  name="checkboxHasNoData"
                  type="checkbox"
                  checked={this.state.checkboxHasNoData}
                  onChange={this.handleInputChange} />
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
                  value={this.state.entriesPerPage}
                  onChange={this.handleChange} />
            </label>
            <br />
            <label>
              Page number :
              <input
                  name="pageNumber"
                  id="pageNumber"
                  type="number"
                  size="5"
                  value={this.state.pageNumber}
                  onChange={this.handleChange} />
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
                  value={this.state.loadGeneNameFilter}
                  onChange={this.handleChange} /><br/>
              <input
                  name="checkboxLoadGeneNameFilter"
                  type="checkbox"
                  checked={this.state.checkboxLoadGeneNameFilter}
                  onChange={this.handleInputChange} />
              Case sensitive<br/>
              <input
                  name="checkboxLoadGeneNameSubstring"
                  type="checkbox"
                  checked={this.state.checkboxLoadGeneNameSubstring}
                  onChange={this.handleInputChange} />
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
                  value={this.state.loadKeywordFilter}
                  onChange={this.handleChange} /><br/>
              <input
                  name="checkboxLoadKeywordFilter"
                  type="checkbox"
                  checked={this.state.checkboxLoadKeywordFilter}
                  onChange={this.handleInputChange} />
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
                  value={this.state.loadOntologyFilter}
                  onChange={this.handleChange} /><br/>
            </label>
            <br />
            <label>
              Count of set_final_experimental_go_ids
              <select name="loadComparisonGoids" id="loadComparisonGoids" size="1" value={this.state.loadComparisonGoids} onChange={this.handleChange}>
                <option value=">=">&gt;=</option>
                <option value="<=">&lt;=</option>
                <option value="==">==</option>
              </select>
              <input
                  name="loadGoidsCount"
                  id="loadGoidsCount"
                  type="number"
                  size="5"
                  value={this.state.loadGoidsCount}
                  onChange={this.handleChange} />
            </label>
            <br />
          </div>

        </form>
    );
  } // render()

} // class ReportTool extends React.Component

const mapStateToProps = state => ({
  selectedMod: getSelectedMod(state),
  latestFilesOnly: getLatestFilesOnly(state),
  diffFields: getDiffFields(state),
  descriptionFileObjects: getDescriptionFileObjects(state)
});

export default connect(mapStateToProps, {setModsList, setDiffFields, fetchModsList, fetchFilesFromFMS})(ReportTool)