import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import pako from 'pako';
import axios from 'axios';

// for github, need to 
// npm install axios
// npm install pako


// UNDO FOR OLD WAY
// function generateJsonUrl(version, date, mod, baseUrl) { return(baseUrl + version + '/' + date + '/' + date + '_' + mod + '.json'); }

function generateFmsJsonUrl(url, mod) {
  let baseUrl = 'https://download.alliancegenome.org/';
//   let sampleMod = 'JSON_WB';
//   let chosenMod = 'JSON_' + mod;
  let correctUrl = url.replace(/WB/g, mod);
  return (baseUrl + correctUrl);
}

function generateDateString(time) {
  let dateObject = new Date(time);
  let year = dateObject.getFullYear().toString();
  let month = (dateObject.getMonth() + 1).toString();
  if (month < 10) { month = '0' + month; }
  let day = dateObject.getDate().toString();
  if (day < 10) { day = '0' + day; }
  let hour = dateObject.getHours().toString();
  if (hour < 10) { hour = '0' + hour; }
  let minute = dateObject.getMinutes().toString();
  if (minute < 10) { minute = '0' + minute; }
  let second = dateObject.getSeconds().toString();
  if (second < 10) { second = '0' + second; }
  let date = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  return date;
}

function renderOption(label, value) {
  return(<option key={label} value={value}>{label}</option>);
}


class ReportTool extends React.Component {
  constructor(props) {
    super(props);

    function getHtmlVar() { return new URLSearchParams(window.location.search); }
    let queryMod = getHtmlVar().get('mod');
    if (queryMod != null) {
       console.log('constructor queryMod ' + queryMod);
//        document.getElementById("mod").value = queryMod;	// html element doesn't exist yet
    } else { queryMod = undefined; }

    this.state = {
      showDownloadLink: false,
      downloadLinkText: 'linkText',
      downloadLinkUrl: 'http://tazendra.caltech.edu/~azurebrd/cgi-bin/forms/agr/data/',

      releaseVersions: {},
      releaseLatest: 'true',
      numReleaseVersions: 0, 
      numVersionsFetched: 0, 
      timeStartReleasesFetch: 0,
      loadTimeMessage: '',

      dateVersionRelease: {},
      numFmsUrlsQueried: 0,
      numFmsUrlsToQuery: 2,

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
//       showDivDiffSection: true,
      showDivDownloadSection: false,
//       showDivLoadSection: false,
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
      baseUrl: '',
      mod: queryMod,
//       mod: undefined,
//       mod: 'WB',
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

    this.handleClickShowSectionDiff = this.handleClickShowSectionDiff.bind(this);
    this.handleClickShowSectionDownload = this.handleClickShowSectionDownload.bind(this);
    this.handleClickShowSectionView = this.handleClickShowSectionView.bind(this);
    this.handleClickTopArrowButton = this.handleClickTopArrowButton.bind(this);
    this.handleClickButton2A = this.handleClickButton2A.bind(this);
    this.handleClickButton2C = this.handleClickButton2C.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeReleaseLatest = this.handleChangeReleaseLatest.bind(this);
    this.handleChangeMod = this.handleChangeMod.bind(this);
    this.handleChangeModEvent = this.handleChangeModEvent.bind(this);
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

    console.log('componentDidMount this.state.mod ' + this.state.mod);

//    console.log("urlRoot " + urlRoot);	// not getting this value when running in docker
    if (urlRoot === undefined) { urlRoot = 'https://reports.alliancegenome.org/'; }

    function getHtmlVar() { return new URLSearchParams(window.location.search); }
    let queryMod = getHtmlVar().get('mod');
    if (queryMod != null) {
//        document.getElementById("mod").value = queryMod;	// updates, but render has already happenned, so doesn't show on browser
//        document.getElementById('mod').value = 'WB';
//        document.getElementById('mod').getElementsByTagName('option')[0].selected = 'selected';	// doesn't work

//        document.getElementById('test').value = queryMod;	// can set some input, if the element is in the render
//        alert('alert');

//        console.log('numFmsUrlsToQuery ' + this.state.numFmsUrlsToQuery);
//        console.log('queryMod ' + queryMod);
//        console.log('this.state.mod ' + this.state.mod);
    }


//     this.getS3PathsFromFms('live', this.state.releaseLatest, event.target.value);
//     this.getS3PathsFromFms('test', this.state.releaseLatest, event.target.value);
//     console.log('handleChangeMod update mod ' + this.state.mod);


// NEW SECTION
    let dateObject = new Date();
    let timeStartReleasesFetch = dateObject.getTime();
    this.setState({ timeStartReleasesFetch: timeStartReleasesFetch });
    console.log( dateObject );
    this.setState({loadTimeMessage: this.state.loadTimeMessage + 'Start loading at ' + dateObject + '.\n'});
    console.log( timeStartReleasesFetch );

// if we had a default MOD, this would populate the files to select with it
    if (this.state.mod !== undefined) { 
      this.getS3PathsFromFms('live', this.state.releaseLatest, this.state.mod);
      this.getS3PathsFromFms('test', this.state.releaseLatest, this.state.mod); }

// //       dateVersionRelease: {},
// //       numFmsUrlsQueried: 0,
// //       numFmsUrlsToQuery: 2,
//     let urlReleaseLive = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-JSON/WB';
//     let release = 'release';
//     fetch(urlReleaseLive)
//       .then(responseRelease => responseRelease.json())
//       .then(responseRelease => { 
//         for (let i in responseRelease) { 
//           let s3Path = responseRelease[i].s3Path;
//           let time = responseRelease[i].releaseVersions[0].releaseDate;
//           let date = generateDateString(time);
//           let version = responseRelease[i].releaseVersions[0].releaseVersion;
// console.log('s3Path ' + s3Path + ' date ' + date + ' version ' + version);
//           let value  = date + '|' + version + '/' + release;
//           let label  = date + ' (' + version + '/' + release + ') path ' + s3Path;
// 
//           let option = renderOption(label, value);
//           let dateOptions = this.state.dateOptions;
//           dateOptions.unshift(option);
//           dateOptions = dateOptions.sort();
//           let numDateOptions = dateOptions.length;
//           this.setState({ dateOptions: dateOptions });
//           this.setState({ numDateOptions: numDateOptions });
//         }
//       });

// NEW SECTION
//    let urlRelease = 'https://fms.alliancegenome.org/api/releaseversion/all';
//    let dateObject = new Date();
//    let timeStartReleasesFetch = dateObject.getTime();
//    this.setState({ timeStartReleasesFetch: timeStartReleasesFetch });
//    console.log( dateObject );
//    this.setState({loadTimeMessage: this.state.loadTimeMessage + 'Start loading at ' + dateObject + '.\n'});
//    console.log( timeStartReleasesFetch );
//    fetch(urlRelease)
//      .then(responseRelease => responseRelease.json())
//      .then(responseRelease => {
// //        let releaseVersions = [];
//        let releaseVersions = {};
//        for (let i in responseRelease) { 
// //          releaseVersions.push(responseRelease[i].releaseVersion) 
//          let date = generateDateString(responseRelease[i].releaseDate);
//          console.log('version ' + responseRelease[i].releaseVersion);
//          console.log('date ' + date);
//          releaseVersions[date] = responseRelease[i].releaseVersion;
//        }
//        this.setState({ releaseVersions: releaseVersions });
//        let numReleaseVersions = Object.keys(releaseVersions).length;
//        this.setState({ numReleaseVersions: numReleaseVersions });
// 
// //        let dateOptions = [];
//        Object.keys(releaseVersions).sort().forEach(function(date) {
// //      this.setState({ baseUrl: 'whatever' });
//          let version = releaseVersions[date];
//          console.log('inside ' + date + ' ' + releaseVersions[date]);
//          let mod = 'WB';
//          this.getS3pathIntoDateOptions(date, version, mod, 'live');
//          this.getS3pathIntoDateOptions(date, version, mod, 'test');
//        }.bind(this))
//      });
// curl -X GET "https://fms.alliancegenome.org/api/releaseversion/all" -H "accept: application/json"
// curl -X GET "https://fms.alliancegenome.org/api/datafile/by/2.3.0/GENE-DESCRIPTION-JSON/WB?latest=true"  -H "accept: application/json" | json_pp
//         "s3Path" : "2.3.0/GENE-DESCRIPTION-TEST-JSON/WB/GENE-DESCRIPTION-TEST-JSON_WB_0.json"
//     https://download.alliancegenome.org/2.3.0/GENE-DESCRIPTION-TEST-JSON/WB/GENE-DESCRIPTION-TEST-JSON_WB_0.json



   let urlTemplate = urlRoot;
   if (urlRoot.match(/textpresso/)) { urlTemplate = urlRoot + 'index.xml'; }
//    console.log('urlTemplate: ' + urlTemplate);
   fetch(urlTemplate)
   .then(response => response.text())
   .then(response => {
     let baseUrl = urlRoot + 'gene-descriptions/';
     this.setState({ baseUrl: baseUrl });

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
//        let label    = date + ' (' + version + ')';
//        let option   = renderOption(label, value);
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

// this doesn't work
//      let modsSelectedHash = {};
//      modsSelectedHash['WB'] = 'selected="selected"';
//      let optionMods = mods.map((mod) => <option key={mod} value={mod} {modsSelected[mod]}>{mod}</option>);

     let optionMods = mods.map((mod) => <option key={mod} value={mod}>{mod}</option>);
     this.setState({ optionMods: optionMods });
     let numMods = mods.length;
     this.setState({ numMods: numMods });
//      let numDateOptions = dateOptions.length;
// UNDO
//      this.setState({ dateOptions: dateOptions });
//      this.setState({ numDateOptions: numDateOptions });

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

  getS3PathsFromFms(testOrLive, releaseLatest, mod) {
    // for some reason handleChangeReleaseLatest(event) does setState, but this state doesn't update to the new value, so have to pass value to function
//       dateVersionRelease: {},
//       numFmsUrlsQueried: 0,
//       numFmsUrlsToQuery: 2,
//     let urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-JSON/WB';
//     let urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-JSON/WB?latest=false';
//     let urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-JSON/WB?latest=' + this.state.releaseLatest;
//     let urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-JSON/WB?latest=' + releaseLatest;
//     let urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-JSON/' + mod + '?latest=' + releaseLatest;	// if fms worked to show the latest for a given version-release instead of latest overall
    let urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-JSON/' + mod + '?latest=false';
    let release = 'release/stage';
    if (testOrLive === 'test') {
//       urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-TEST-JSON/WB';
//       urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-TEST-JSON/WB?latest=false';
//       urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-TEST-JSON/WB?latest=' + this.state.releaseLatest;
//       urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-TEST-JSON/WB?latest=' + releaseLatest;
//       urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-TEST-JSON/' + mod + '?latest=' + releaseLatest;	// if fms worked to show the latest for a given version-release instead of latest overall
      urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-TEST-JSON/' + mod + '?latest=false';
      release = 'pre-release/build'; }
    fetch(urlRelease)
      .then(responseRelease => responseRelease.json())
      .then(responseRelease => { 
        let dateVersionRelease = this.state.dateVersionRelease;
        for (let i in responseRelease) { 
          let s3Path = responseRelease[i].s3Path;
//           let time = responseRelease[i].releaseVersions[0].releaseDate;
          let time = responseRelease[i].uploadDate;
          let date = generateDateString(time);
          let version = responseRelease[i].releaseVersions[0].releaseVersion;
          for (let j in responseRelease[i].releaseVersions) { 	// could have multiple versions for a file, always use the oldest for Ranjana
            if (responseRelease[i].releaseVersions[j].releaseVersion < version) {
              version = responseRelease[i].releaseVersions[j].releaseVersion;
            }
          }
//           console.log('s3Path ' + s3Path + ' date ' + date + ' version ' + version);	// s3Paths found
//           let value  = date + '|' + version + '/' + release;
          let value  = s3Path;
//           let label  = date + ' (' + version + '/' + release + ')';
          let label  = version + ' - ' + release + ' - ' + date;
          dateVersionRelease[label] = value;
        }
        this.setState({ dateVersionRelease: dateVersionRelease });
        this.setState({ numFmsUrlsQueried: this.state.numFmsUrlsQueried + 1 });
        if (this.state.numFmsUrlsQueried >= this.state.numFmsUrlsToQuery) {
          let versionReleaseHash = {};
          Object.keys(dateVersionRelease).sort().reverse().forEach(function(label) {
            // sort labels and process in reverse, to get most recent first
            let value = dateVersionRelease[label] + '|' + label;
            let matches  = label.match(/^(.*?) - (.*?) - (.*?)$/);
            let version  = matches[1];
            let release  = matches[2];
//             let date     = matches[3];
//             console.log('creating dateOptions date ' + date + ' version ' + version + ' release ' + release5;
            let versionRelease = version + ' - ' + release;
            if ( (releaseLatest === 'true') && (versionRelease in versionReleaseHash) ) { return; }
	      // if only want latest release and version-release has already been added, skip it
            versionReleaseHash[versionRelease] = versionRelease;	// add versionRelease to dict of already added
            let option = renderOption(label, value);
            let dateOptions = this.state.dateOptions;
            dateOptions.push(option);					// add older version releases later in the list
//             dateOptions = dateOptions.sort();			// remove, this doesn't do anything
            let numDateOptions = dateOptions.length;
            this.setState({ dateOptions: dateOptions });
            this.setState({ numDateOptions: numDateOptions });
          }.bind(this))
          let dateObject = new Date();
          let timeEndVersionsFetch = dateObject.getTime();
          let diffTime = timeEndVersionsFetch - this.state.timeStartReleasesFetch;
          console.log('time passed ' + diffTime + ' milliseconds');
          this.setState({loadTimeMessage: this.state.loadTimeMessage + 'End loading at ' + dateObject + '.\n'});
          this.setState({loadTimeMessage: this.state.loadTimeMessage + 'Time passed ' + diffTime + ' milliseconds.\n'});
          document.getElementById("date1").value = "";
          document.getElementById("date2").value = "";
          document.getElementById("dateDownload").value = "";
          document.getElementById("dateLoad").value = "";
        }
      });
  } // getS3pathsFromFms(testOrLive)

//   getS3pathIntoDateOptions(date, version, mod, test) {
//     console.log('getS3path ' + version)
//     let subdir = 'GENE-DESCRIPTION-JSON';
//     let release = 'release';
//     if (test === 'test') { 
//       release = 'pre-release';
//       subdir = 'GENE-DESCRIPTION-TEST-JSON'; }
//     let urlFindLocation = 'https://fms.alliancegenome.org/api/datafile/by/' + version + '/' + subdir + '/' + mod + '?latest=true';
//     fetch(urlFindLocation)
//       .then(responseFindLocation => responseFindLocation.json())
//       .then(responseFindLocation => {
//         this.setState({numVersionsFetched: this.state.numVersionsFetched + 1});
//         if (responseFindLocation[0] !== undefined) { 
//           if (responseFindLocation[0].s3Path !== undefined) { 
//             console.log('insidefound ' + responseFindLocation[0].s3Path); 
//             let s3Path = responseFindLocation[0].s3Path;
//             let value  = date + '|' + version + '/' + release;
//             let label  = date + ' (' + version + '/' + release + ') path ' + s3Path;
//             let option = renderOption(label, value);
//             let dateOptions = this.state.dateOptions;
//             dateOptions.unshift(option);
//             dateOptions = dateOptions.sort();
//             let numDateOptions = dateOptions.length;
//             this.setState({ dateOptions: dateOptions });
//             this.setState({ numDateOptions: numDateOptions });
//           }
//         }
// // console.log(urlFindLocation + ' ' + this.state.numVersionsFetched + ' ? ' + this.state.numReleaseVersions);
//         if (this.state.numVersionsFetched >= 2 * this.state.numReleaseVersions) {
//           let dateObject = new Date();
//           let timeEndVersionsFetch = dateObject.getTime();
//           let diffTime = timeEndVersionsFetch - this.state.timeStartReleasesFetch;
//           console.log('time passed ' + diffTime + ' milliseconds');
//           this.setState({loadTimeMessage: this.state.loadTimeMessage + 'End loading at ' + dateObject + '.\n'});
//           this.setState({loadTimeMessage: this.state.loadTimeMessage + 'Time passed ' + diffTime + ' milliseconds.\n'});
//           document.getElementById("date1").value = "";
//           document.getElementById("date2").value = "";
//           document.getElementById("dateDownload").value = "";
//           document.getElementById("dateLoad").value = "";
//         }
//       });
//   } // getS3pathIntoDateOptions(date, version, mod, test)

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

  handleChangeModEvent(event) {
    this.handleChange(event);
    console.log('handleChangeModEvent setting mod to ' + event.target.value);
    this.setState({ mod: event.target.value});
    this.handleChangeMod(event.target.value);
  }

  handleChangeMod(mod) {
    this.setState({ numFmsUrlsQueried: 0 });
    this.setState({ dateVersionRelease: {} });
    this.setState({ dateOptions: [] });
    this.setState({ numDateOptions: 0 });
    this.setState({ loadTimeMessage: ''});
    this.getS3PathsFromFms('live', this.state.releaseLatest, mod);
    this.getS3PathsFromFms('test', this.state.releaseLatest, mod);
    console.log('handleChangeMod update mod ' + this.state.mod);
  }

  handleChangeReleaseLatest(event) {
    this.handleChange(event);
// don't know why this state value hasn't updated to the setState value, so need to pass event.target.value to getS3PathsFromFms
// console.log('have failed to set releaseLatest ' + this.state.releaseLatest);	
    this.setState({ numFmsUrlsQueried: 0 });
    this.setState({ dateVersionRelease: {} });
    this.setState({ dateOptions: [] });
    this.setState({ numDateOptions: 0 });
    this.setState({loadTimeMessage: ''});
    this.getS3PathsFromFms('live', event.target.value, this.state.mod);
    this.getS3PathsFromFms('test', event.target.value, this.state.mod);
    console.log('update release latest ' + this.state.releaseLatest);
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
    if (this.state.dateLoad === undefined) { errorMessage += 'Choose a file\n';  }
    if (this.state.mod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
    let arrDateLoad = this.state.dateLoad.split('|');
    let selectedLoadValue   = arrDateLoad[0];
    let selectedLoadLabel   = arrDateLoad[1];
    let matchesLoad  = selectedLoadLabel.match(/^(.*?) - (.*?) - (.*?)$/);
    let versionLoad  = matchesLoad[1];
    let releaseLoad  = matchesLoad[2];
    let dateLoad     = matchesLoad[3];
    let urlLoad = generateFmsJsonUrl(selectedLoadValue, this.state.mod);
    console.log('load date ' + dateLoad + ' version ' + versionLoad + ' releaseLoad ' + releaseLoad);
// UNDO FOR OLD WAY
//     let urlLoad = generateJsonUrl(versionLoad, dateLoad, this.state.mod, this.state.baseUrl);
// NEW SECTION
//     let urlLoad = generateFmsJsonUrl(this.state.dateLoad, this.state.mod);

//             let value = dateVersionRelease[label] + '|' + label;

    console.log('download ' + urlLoad);
    this.setState({showDivMenuButton2A: false});
    this.setState({showDivMenuButton2C: true});
    this.setState({showDivTopArrowButton: true});
    var element = document.getElementById("anchor2Cresult");
    element.scrollIntoView();
    this.setState({showDivLoadLoading: true});

// can no longer fetch, because some files are gzipped, need to user request and zlib
//     fetch(urlLoad)
//       .then(response => response.json())
//       .then(response => { this.processDataLoad(response) }
//     )
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

              for (let j in this.state.diffFieldsArray) {
                let diffField = this.state.diffFieldsArray[j];
                let diffFieldValue = response.data[i][diffField] || '';
                if (this.state.checkboxDiffFields[diffField] === true) {
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
              } } } } }

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
    if (this.state.dateDownload === undefined) { errorMessage += 'Choose a file\n';  }
    if (this.state.mod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }

//     let arrDateDownload = this.state.dateDownload.split('|');
//     let dateDownload    = arrDateDownload[0];
//     let versionDownload = arrDateDownload[1];
//     console.log('download date ' + dateDownload + ' version ' + versionDownload);
// UNDO FOR OLD WAY
//     let urlDownload = generateJsonUrl(versionDownload, dateDownload, this.state.mod, this.state.baseUrl);

// NEW SECTION
//     let urlDownload = generateFmsJsonUrl(this.state.dateDownload, this.state.mod);
//     console.log('download ' + urlDownload);

    let arrDateDownload = this.state.dateDownload.split('|');
    let selectedDownloadValue   = arrDateDownload[0];
    let selectedDownloadLabel   = arrDateDownload[1];
    let matchesDownload  = selectedDownloadLabel.match(/^(.*?) - (.*?) - (.*?)$/);
    let versionDownload  = matchesDownload[1];
    let releaseDownload  = matchesDownload[2];
    let dateDownload     = matchesDownload[3];
    let urlDownload = generateFmsJsonUrl(selectedDownloadValue, this.state.mod);
    console.log('download date ' + dateDownload + ' version ' + versionDownload + ' releaseDownload ' + releaseDownload);

    let filename = dateDownload + '_' + this.state.mod + '.json';
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
    if (this.state.dateDownload === undefined) { errorMessage += 'Choose a file\n';  }
    if (this.state.mod === undefined) { errorMessage += 'Choose a mod\n';  }
    if (errorMessage !== '') { alert(errorMessage); return; }
// UNDO FOR OLD WAY
//     let arrDateDownload = this.state.dateDownload.split('|');
//     let dateDownload    = arrDateDownload[0];
//     let versionDownload = arrDateDownload[1];
//     let urlDownload = generateJsonUrl(versionDownload, dateDownload, this.state.mod, this.state.baseUrl);
// NEW SECTION
//     let urlDownload = generateFmsJsonUrl(this.state.dateDownload, this.state.mod);
//     console.log('download ' + urlDownload);
    let arrDateDownload = this.state.dateDownload.split('|');
    let selectedDownloadValue   = arrDateDownload[0];
    let selectedDownloadLabel   = arrDateDownload[1];
    let matchesDownload  = selectedDownloadLabel.match(/^(.*?) - (.*?) - (.*?)$/);
    let versionDownload  = matchesDownload[1];
    let releaseDownload  = matchesDownload[2];
    let dateDownload     = matchesDownload[3];
    let urlDownload = generateFmsJsonUrl(selectedDownloadValue, this.state.mod);
    console.log('download date ' + dateDownload + ' version ' + versionDownload + ' releaseDownload ' + releaseDownload);
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
//     var element = document.getElementById("anchor2Acontrol");
//     element.scrollIntoView();
    event.preventDefault();
  } // handleClickShowSectionDiff(event)
  handleClickShowSectionDownload(event) {
    console.log('click ' + event.target.value);
    this.setState({showDivDiffSection: false});
    this.setState({showDivDownloadSection: true});
    this.setState({showDivLoadSection: false});
    this.setState({backgroundDiffTab: 'white'});
    this.setState({backgroundDownloadTab: '#ddd'});
    this.setState({backgroundLoadTab: 'white'});
//     var element = document.getElementById("anchor2Bcontrol");
//     element.scrollIntoView();
    event.preventDefault();
  } // handleClickShowSectionDownload(event)
  handleClickShowSectionView(event) {
    console.log('click ' + event.target.value);
    this.setState({showDivDiffSection: false});
    this.setState({showDivDownloadSection: false});
    this.setState({showDivLoadSection: true});
    this.setState({backgroundDiffTab: 'white'});
    this.setState({backgroundDownloadTab: 'white'});
    this.setState({backgroundLoadTab: '#ddd'});
//     var element = document.getElementById("div_section_load");
//     element.scrollIntoView();
    event.preventDefault();
  } // handleClickShowSectionView(event)

  handleClickTopArrowButton(event) {
    console.log('click ' + event.target.value);
    var element = document.getElementById("div_section_mod");
    element.scrollIntoView();
    this.setState({showDivDiffResult: false});
    this.setState({showDivLoadResult: false});
//     this.setState({showDivTopArrowButton: false});
//     this.setState({showDivMenuButton2A: false});
//     this.setState({showDivMenuButton2C: false});
    event.preventDefault();
  } // handleClickButton2A(event)

  handleClickButton2A(event) {
    console.log('click ' + event.target.value);
    var element = document.getElementById("anchor2Acontrol");
    element.scrollIntoView();
//     this.setState({showDivTopArrowButton: false});
//     this.setState({showDivMenuButton2A: false});
//     this.setState({showDivMenuButton2C: false});
    event.preventDefault();
  } // handleClickButton2A(event)

  handleClickButton2C(event) {
    console.log('click ' + event.target.value);
    var element = document.getElementById("anchor2Ccontrol");
    element.scrollIntoView();
//     this.setState({showDivTopArrowButton: false});
//     this.setState({showDivMenuButton2A: false});
//     this.setState({showDivMenuButton2C: false});
    event.preventDefault();
  } // handleClickButton2C(event)

  handleSubmitCompare(event) {
    let t0 = Date.now();
    console.log('submit ' + event.target.value);
    event.preventDefault();
    let errorMessage = '';
    if (this.state.date1 === undefined) {     errorMessage += 'Choose an old file\n';         }
    if (this.state.date2 === undefined) {     errorMessage += 'Choose a new file\n';          }
    if (this.state.diffField === undefined) { errorMessage += 'Choose a field to compare\n';  }
    if (this.state.mod === undefined) {       errorMessage += 'Choose a mod\n';               }
    if (errorMessage !== '') { alert(errorMessage); return; }

//     console.log('this.state.date1 : ' + this.state.date1);
//     let arrDate1 = this.state.date1.split('|');
// //     let version1 = arrDate1[0];
// //     let date1    = arrDate1[1];
//     let date1    = arrDate1[0];
//     let version1 = arrDate1[1];
// // UNDO FOR OLD WAY
// //     let url1     = generateJsonUrl(version1, date1, this.state.mod, this.state.baseUrl);
// // NEW SECTION
//     let url1 = generateFmsJsonUrl(date1, this.state.mod);
//     let arrDate2 = this.state.date2.split('|');
// //     let version2 = arrDate2[0];
// //     let date2    = arrDate2[1];
//     let date2    = arrDate2[0];
//     let version2 = arrDate2[1];
// // UNDO FOR OLD WAY
// //     let url2     = generateJsonUrl(version2, date2, this.state.mod, this.state.baseUrl);
// // NEW SECTION
//     let url2 = generateFmsJsonUrl(date2, this.state.mod);

    let arrDate1 = this.state.date1.split('|');
    let selected1Value   = arrDate1[0];
    let selected1Label   = arrDate1[1];
    let matches1  = selected1Label.match(/^(.*?) - (.*?) - (.*?)$/);
    let version1  = matches1[1];
    let release1  = matches1[2];
    let date1     = matches1[3];
    let url1 = generateFmsJsonUrl(selected1Value, this.state.mod);
    console.log('diff 1 date ' + date1 + ' version ' + version1 + ' release1 ' + release1);

    let arrDate2 = this.state.date2.split('|');
    let selected2Value   = arrDate2[0];
    let selected2Label   = arrDate2[1];
    let matches2  = selected2Label.match(/^(.*?) - (.*?) - (.*?)$/);
    let version2  = matches2[1];
    let release2  = matches2[2];
    let date2     = matches2[3];
    let url2 = generateFmsJsonUrl(selected2Value, this.state.mod);
    console.log('diff 2 date ' + date2 + ' version ' + version2 + ' release2 ' + release2);

    this.setState({headerStatsDate1: date1});
    this.setState({headerStatsDate2: date2});
    this.setState({headerDiffDate1: date1});
    this.setState({headerDiffDate2: date2});
    this.setState({showDivDiffLoading: true});
    this.setState({showDivDiffNavigation: true});
    this.setState({showDivMenuButton2A: true});
    this.setState({showDivMenuButton2C: false});
    this.setState({showDivTopArrowButton: true});
    this.setState({showDivLoadResult: false});
    var element = document.getElementById("anchor2Aresult");
    element.scrollIntoView();

// can no longer fetch, because some files are gzipped, need to user request and zlib
//     fetch(url1)
//       .then(response1 => response1.json())
//       .then(response1 => {
//           fetch(url2)
//             .then(response2 => response2.json())
//             .then(response2 => {
//             });
//       });

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
        <div style={{display: this.state.showDivTopArrowButton ? 'block' : 'none', position: 'fixed', top: 25, right: 75}}><span style={{color: 'lime', fontSize: 30}} onClick={this.handleClickTopArrowButton}>&#8593;</span></div>
        <div style={{display: this.state.showDivMenuButton2A ? 'block' : 'none', position: 'fixed', top: 25, right: 25}}><span style={{color: 'lime', fontSize: 30}} onClick={this.handleClickButton2A}>&#9776;</span></div>
        <div style={{display: this.state.showDivMenuButton2C ? 'block' : 'none', position: 'fixed', top: 25, right: 25}}><span style={{color: 'lime', fontSize: 30}} onClick={this.handleClickButton2C}>&#9776;</span></div>

        <div id='div_section_mod'>
          <label>
            <h3>Select your Mod:</h3>
            <select name="mod" id="mod" size={this.state.numMods} defaultValue="" onChange={this.handleChangeModEvent}>
              {this.state.optionMods}
            </select>
          </label><br/>
          <label>
            <input
              type="radio"
              name="releaseLatest"
              value="true"
              onChange={this.handleChangeReleaseLatest}
              checked={this.state.releaseLatest === "true"}
            />
            Latest file for a given version and release type
          </label><br/>
          <label>
            <input
              type="radio"
              name="releaseLatest"
              value="false"
              onChange={this.handleChangeReleaseLatest}
              checked={this.state.releaseLatest === "false"}
            />
            All Files
          </label><br/><br/>
        </div>

        <div id='div_section_display_load_time' style={{display: 'none'}}>
          <label>{this.state.loadTimeMessage.split("\n").map((i,key) => { return <div key={key}>{i}</div>; })}
          </label>
        </div>

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
        </div>

        <div id='div_section_download' style={{display: this.state.showDivDownloadSection ? 'block' : 'none'}}>
          <h3>Download a file</h3>
          <label id='anchor2Bcontrol'>
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
          {this.state.diffFieldsArray.map(function(item){
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


ReactDOM.render(
  <ReportTool />,
  document.getElementById('root')
);
