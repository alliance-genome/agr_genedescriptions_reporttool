import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function generateJsonUrl(version, date, mod, baseUrl) {
  return(baseUrl + version + '/' + date + '/' + date + '_' + mod + '.json');
}


class ReportTool extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showDownloadLink: false,
      downloadLinkText: 'linkText',
      downloadLinkUrl: 'http://tazendra.caltech.edu/~azurebrd/cgi-bin/forms/agr/data/',
      rowsTableLoad: [],
      rowsTableLoadStats: [],
      rowsTableDiff: [],
      rowsTableDiffStats: [],
      showDivTopArrowButton: false,
      showDivMenuButton2A: false,
      showDivMenuButton2C: false,
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
      baseUrl: '',
      mod: undefined,
      diffKeywordFilter: '',
      diffGeneNameFilter: '',
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
      optionMods: [],
      numMods: 0,
      diffField: undefined,
      optionDiffFields: [],
      numDiffFields: 0,
      diffFieldsArray: [],
      diffFieldsHash: [],
      dateOptions: [],
      numDateOptions: 0,
      loadFieldsMatchCount: [],
      showLabelFieldsMatchCount: [],
      checkboxDiffFields: [],
      checkboxDescription: true,
      checkboxDoDescription: true,
      checkboxGoDescription: true,
      checkboxOrthologyDescription: true,
      checkboxHasData: true,
      checkboxHasNoData: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputChangeCheckboxDiffFields = this.handleInputChangeCheckboxDiffFields.bind(this);

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
   let urlRoot = process.env.REACT_APP_URLROOT;
   console.log("urlRoot " + urlRoot);	// not getting this value when running in docker
   if (urlRoot === undefined) { urlRoot = 'https://reports.alliancegenome.org/'; }

   let urlTemplate = urlRoot;
   if (urlRoot.match(/textpresso/)) { urlTemplate = urlRoot + 'index.xml'; }
   fetch(urlTemplate)
   .then(response => response.text())
   .then(response => {
     let baseUrl = urlRoot + 'gene-descriptions/';
     this.setState({ baseUrl: baseUrl });

     function renderOption(label, value) {
       return(<option key={label} value={value}>{label}</option>);
     }

     let arrayFiles = response.match(/gene-descriptions[^<]*?\/\d{8}\/[^<]*?\.json/g);
     let modsHash = {};
     let datesHash = {};
     for (let i in arrayFiles) {
       let fileLocation = arrayFiles[i];
       let matches  = fileLocation.match(/gene-descriptions\/(.*?)\/\d{8}\/(\d{8})_([\w]*?)\.json/);
       let version  = matches[1];
       let date     = matches[2];
       let mod      = matches[3];
//        let value    = version + '|' + date;
       let value    = date + '|' + version;
       let label    = date + ' (' + version + ')';
       let option   = renderOption(label, value);
       datesHash[value] = value;
       modsHash[mod] = mod;
     }
     let mods = Object.keys(modsHash);
     let dateOptions = [];
     Object.keys(datesHash).sort().forEach(function(key) {
//        let partsArray = key.split('|'), version = partsArray[0], date = partsArray[1];
       let partsArray = key.split('|'), date = partsArray[0], version = partsArray[1];
//        let value   = version + '|' + date;
       let value    = date + '|' + version;
       let label   = date + ' (' + version + ')';
       let option = renderOption(label, value);
       dateOptions.unshift(option);
     });
     dateOptions = dateOptions.sort();
     let optionMods = mods.map((mod) => <option key={mod} value={mod}>{mod}</option>);
     this.setState({ optionMods: optionMods });
     let numMods = mods.length;
     this.setState({ numMods: numMods });
     let numDateOptions = dateOptions.length;
     this.setState({ dateOptions: dateOptions });
     this.setState({ numDateOptions: numDateOptions });

     let diffFieldsHash = [];
     diffFieldsHash['description'] = "Description (Full)";
     diffFieldsHash['do_description'] = "DO Description";
     diffFieldsHash['go_description'] = "GO Description";
     diffFieldsHash['orthology_description'] = "Orthology Description";
     diffFieldsHash['tissue_expression_description'] = "Expression Description";
     
     this.setState({ diffFieldsHash: diffFieldsHash });
     let diffFieldsArray = Object.keys(diffFieldsHash);
     this.setState({ diffFieldsArray: diffFieldsArray });
     let optionDiffFields = diffFieldsArray.map((diffField) => <option key={diffField} value={diffField}>{diffField}</option>);
     this.setState({ optionDiffFields: optionDiffFields });
     let numDiffFields = diffFieldsArray.length;
     this.setState({ numDiffFields: numDiffFields });

     let checkboxDiffFields = [];
     for (let diffField in response.diffFields) { checkboxDiffFields[diffField] = true; }
     this.setState({ checkboxDiffFields: checkboxDiffFields });

     document.getElementById("mod").value = "";
     document.getElementById("date1").value = "";
     document.getElementById("date2").value = "";
     document.getElementById("dateDownload").value = "";
     document.getElementById("dateLoad").value = "";
     document.getElementById("diffField").value = "";
   })
 } // componentDidMount()

  handleChange(event) {
    const target = event.target;
    const name = target.name;

console.log('set ' + name + ' value ' + event.target.value);
    this.setState({
      [name]: event.target.value
    });
  }

  handleChangePage(event) {
    this.handleChange(event);
    console.log('page ' + this.state.pageNumber + ' entriesPerPage ' + this.state.entriesPerPage);
  }

  processSubmitLoadAction() {
    this.setState({showDivDiffResult: false});
    this.setState({showDivTopArrowButton: false});
    this.setState({showDivMenuButton2A: false});
    this.setState({showDivMenuButton2C: false});
    let errorMessage = '';
    if (this.state.dateLoad === undefined) { errorMessage += 'Choose a file\n';  }
    if (this.state.mod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let arrDateLoad = this.state.dateLoad.split('|');
//     let versionLoad = arrDateLoad[0];
//     let dateLoad = arrDateLoad[1];
    let dateLoad    = arrDateLoad[0];
    let versionLoad = arrDateLoad[1];
    let urlLoad = generateJsonUrl(versionLoad, dateLoad, this.state.mod, this.state.baseUrl);

    console.log('download ' + urlLoad);
    this.setState({showDivMenuButton2C: true});
    this.setState({showDivTopArrowButton: true});
    var element = document.getElementById("anchor2Cresult");
    element.scrollIntoView();
    this.setState({showDivLoadLoading: true});
    fetch(urlLoad)
      .then(response => response.json())
      .then(response => { 
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
          for (let j in this.state.diffFieldsArray) {
            let diffField = this.state.diffFieldsArray[j];
            if (this.state.checkboxDiffFields[diffField] === true) { showFieldsMatchCount[diffField] = true; }
              else { showFieldsMatchCount[diffField] = false; }
            fieldsMatchCount[diffField] = 0; }
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

            let count_set_final_go_ids_f = 0;
            let count_set_final_go_ids_p = 0;
            let count_set_final_go_ids_c = 0;
            if ('set_final_go_ids_f' in response.data[i].stats) {
              count_set_final_go_ids_f = response.data[i].stats.set_final_go_ids_f.length; }
            if ('set_final_go_ids_p' in response.data[i].stats) {
              count_set_final_go_ids_p = response.data[i].stats.set_final_go_ids_p.length; }
            if ('set_final_go_ids_c' in response.data[i].stats) {
              count_set_final_go_ids_c = response.data[i].stats.set_final_go_ids_c.length; }
            let count_set_final_go_ids = count_set_final_go_ids_f + count_set_final_go_ids_p + count_set_final_go_ids_c;
            
            if ( ( (this.state.loadComparisonGoids === '>=') && 
                   (count_set_final_go_ids >= this.state.loadGoidsCount) ) 
              || ( (this.state.loadComparisonGoids === '<=') && 
                   (count_set_final_go_ids <= this.state.loadGoidsCount) ) 
              || ( (this.state.loadComparisonGoids === '==') && 
                   (count_set_final_go_ids === this.state.loadGoidsCount) ) ) {

              for (let j in this.state.diffFieldsArray) {
                let diffField = this.state.diffFieldsArray[j];
                let diffFieldValue = response.data[i][diffField] || '';
                if (this.state.checkboxDiffFields[diffField] === true) {
                  if ( ( ( this.state.checkboxHasData ) && (diffFieldValue !== '') ) ||
                       ( ( this.state.checkboxHasNoData ) && (diffFieldValue === '') ) ) {
                    let keywordPass = false;
                    let genenamePass = false;
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
                    if ( (keywordPass === true) && (genenamePass === true) ) {
                      geneHasSomeData = true;
                      fieldsMatchCount[diffField] += 1;
                      if ( (matchCount > skipCount) && (matchCount <= doneCount) ) {
                        const item = {gene_id: gene_id, gene_name: gene_name, field: diffField, text: diffFieldValue};
                        tempRowsTableLoad.push(item);
              } } } } }

              if (geneHasSomeData) { matchCount++; }
//                         loadFieldsMatchCount: [],
//               if (matchCount > doneCount) { break; }			// to process entries only until desired amount, Ranjana wants to always process everything to get counts
            }
          }
          this.setState({ rowsTableLoad: tempRowsTableLoad });
          this.setState({ loadFieldsMatchCount: fieldsMatchCount });
          this.setState({ showLabelFieldsMatchCount: showFieldsMatchCount });

      })
  } // processSubmitLoadAction()

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
    if (this.state.dateDownload === undefined) { errorMessage += 'Choose a file\n';  }
    if (this.state.mod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let arrDateDownload = this.state.dateDownload.split('|');
//     let versionDownload = arrDateDownload[0];
//     let dateDownload = arrDateDownload[1];
    let dateDownload    = arrDateDownload[0];
    let versionDownload = arrDateDownload[1];
    let urlDownload = generateJsonUrl(versionDownload, dateDownload, this.state.mod, this.state.baseUrl);
    console.log('download ' + urlDownload);

    let filename = dateDownload + '_' + this.state.mod + '.json';
    let downloadLink = document.createElement("a");
    downloadLink.setAttribute( 'href', urlDownload );
    downloadLink.setAttribute( 'target', '_blank' );
    downloadLink.setAttribute( 'download', filename );
    let downloadText = 'download ' + filename;
    downloadLink.innerHTML = downloadText;
    this.setState({downloadLinkUrl: urlDownload});
    this.setState({downloadLinkText: downloadText});
    this.setState({showDownloadLink: true});
  }

  handleSubmitOpenTab(event) {
    event.preventDefault();
    console.log('submit ' + event.target.value);
    let errorMessage = '';
    if (this.state.dateDownload === undefined) { errorMessage += 'Choose a file\n';  }
    if (this.state.mod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let arrDateDownload = this.state.dateDownload.split('|');
//     let versionDownload = arrDateDownload[0];
//     let dateDownload = arrDateDownload[1];
    let dateDownload    = arrDateDownload[0];
    let versionDownload = arrDateDownload[1];
    let urlDownload = generateJsonUrl(versionDownload, dateDownload, this.state.mod, this.state.baseUrl);
    console.log('download ' + urlDownload);
    window.open(urlDownload);
  }

  handleClickTopArrowButton(event) {
    console.log('click ' + event.target.value);
    var element = document.getElementById("anchor2Acontrol");
    element.scrollIntoView();
    this.setState({showDivDiffResult: false});
    this.setState({showDivLoadResult: false});
    this.setState({showDivTopArrowButton: false});
    this.setState({showDivMenuButton2A: false});
    this.setState({showDivMenuButton2C: false});
    event.preventDefault();
  } // handleClickButton2A(event)

  handleClickButton2A(event) {
    console.log('click ' + event.target.value);
    var element = document.getElementById("anchor2Acontrol");
    element.scrollIntoView();
    this.setState({showDivTopArrowButton: false});
    this.setState({showDivMenuButton2A: false});
    this.setState({showDivMenuButton2C: false});
    event.preventDefault();
  } // handleClickButton2A(event)

  handleClickButton2C(event) {
    console.log('click ' + event.target.value);
    var element = document.getElementById("anchor2Ccontrol");
    element.scrollIntoView();
    this.setState({showDivTopArrowButton: false});
    this.setState({showDivMenuButton2A: false});
    this.setState({showDivMenuButton2C: false});
    event.preventDefault();
  } // handleClickButton2C(event)

  handleSubmitCompare(event) {
    let t0 = Date.now();
    console.log('submit ' + event.target.value);
    let errorMessage = '';
    if (this.state.date1 === undefined) {     errorMessage += 'Choose an old file\n';         }
    if (this.state.date2 === undefined) {     errorMessage += 'Choose a new file\n';          }
    if (this.state.diffField === undefined) { errorMessage += 'Choose a field to compare\n';  }
    if (this.state.mod === undefined) {       errorMessage += 'Choose a mod\n';               }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let arrDate1 = this.state.date1.split('|');
//     let version1 = arrDate1[0];
//     let date1    = arrDate1[1];
    let date1    = arrDate1[0];
    let version1 = arrDate1[1];
    let url1     = generateJsonUrl(version1, date1, this.state.mod, this.state.baseUrl);
    let arrDate2 = this.state.date2.split('|');
//     let version2 = arrDate2[0];
//     let date2    = arrDate2[1];
    let date2    = arrDate2[0];
    let version2 = arrDate2[1];
    let url2     = generateJsonUrl(version2, date2, this.state.mod, this.state.baseUrl);
    this.setState({headerStatsDate1: date1});
    this.setState({headerStatsDate2: date2});
    this.setState({headerDiffDate1: date1});
    this.setState({headerDiffDate2: date2});
    this.setState({showDivDiffLoading: true});
    this.setState({showDivDiffNavigation: true});
    this.setState({showDivMenuButton2A: true});
    this.setState({showDivTopArrowButton: true});
    this.setState({showDivLoadResult: false});
    var element = document.getElementById("anchor2Aresult");
    element.scrollIntoView();

    fetch(url1)
      .then(response1 => response1.json())
      .then(response1 => {
          fetch(url2)
            .then(response2 => response2.json())
            .then(response2 => {
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
            });
      });

    let t1 = Date.now();
    console.log('Render took', t1-t0, 'ms');
    event.preventDefault();
  } // handleSubmitCompare(event)

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
    let checkboxDiffFieldsValue = this.state.checkboxDiffFields;
    let checkboxFieldName = name.replace("checkbox_", "");
    let lowercaseCheckboxFieldName = checkboxFieldName.toLowerCase();
    checkboxDiffFieldsValue[lowercaseCheckboxFieldName] = value;
    this.setState({
      checkboxDiffFields: checkboxDiffFieldsValue
    });
  }


  render() {
    return (
      <form>
        <div style={{display: this.state.showDivTopArrowButton ? 'block' : 'none', position: 'fixed', top: 25, right: 50}}><span style={{color: 'lime', fontSize: 30}} onClick={this.handleClickTopArrowButton}>&#8593;</span></div>
        <div style={{display: this.state.showDivMenuButton2A ? 'block' : 'none', position: 'fixed', top: 25, right: 25}}><span style={{color: 'lime', fontSize: 30}} onClick={this.handleClickButton2A}>&#9776;</span></div>
        <div style={{display: this.state.showDivMenuButton2C ? 'block' : 'none', position: 'fixed', top: 25, right: 25}}><span style={{color: 'lime', fontSize: 30}} onClick={this.handleClickButton2C}>&#9776;</span></div>

        <label>
          <h3>1. Select your Mod:</h3>
          <select name="mod" id="mod" size={this.state.numMods} defaultValue="" onChange={this.handleChange}>
            {this.state.optionMods}
          </select>
        </label><br/><br/>
        <hr />

        <h3 id='anchor2Aresult'>2.a. Compare Files</h3>

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
          <select name="date1" id="date1" size={this.state.numDateOptions} onChange={this.handleChange}>
            {this.state.dateOptions}
          </select>
        </label>
        </td><td style={{verticalAlign: 'top'}}>
        <label>
          Select new file:<br/>
          <select name="date2" id="date2" size={this.state.numDateOptions} onChange={this.handleChange}>
            {this.state.dateOptions}
          </select>
        </label>
        </td><td style={{verticalAlign: 'top'}}>
        <label>
          Select field to compare:<br/>
          <select name="diffField" id="diffField" size={this.state.numDiffFields}  onChange={this.handleChange}>
            {this.state.optionDiffFields}
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

        <hr />
        <h3>2.b. Download a file</h3>
        <label>
          Select file to download:<br/>
          <select name="dateDownload" id="dateDownload" size={this.state.numDateOptions} onChange={this.handleChange}>
            {this.state.dateOptions}
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

        <hr />

        <h3 id='anchor2Cresult'>2.c. View a file</h3>

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
        {this.state.diffFieldsArray.map(function(item){
          let name = 'matchcount_' + item;
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
          <select name="dateLoad" id="dateLoad" size={this.state.numDateOptions} onChange={this.handleChange}>
            {this.state.dateOptions}
          </select>
        </label>
        <br />
        <input type="button" value="Load JSON" onClick={this.handleSubmitLoad}/><br/>
        <br />
        <label>
          Which fields to display : <br />
        </label>
        {this.state.diffFieldsArray.map(function(item){
          let name = 'checkbox_' + item;
          let label_key = 'label_key_' + item;
          return (
            <label key={label_key}>
              <input
                name={name}
                type="checkbox"
                checked={this.state.checkboxDiffFields[item]}
                onChange={this.handleInputChangeCheckboxDiffFields} 
              />{this.state.diffFieldsHash[item]}<br/>
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

      </form>
    );
  } // render()

} // class ReportTool extends React.Component


ReactDOM.render(
  <ReportTool />,
  document.getElementById('root')
);
