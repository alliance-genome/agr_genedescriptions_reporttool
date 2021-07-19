import {generateFmsJsonUrl, getS3PathsFromFms, getStatsFiles, requestAndGunzipBodyIfNecessary} from "../lib";

export const SET_SELECTED_MOD = "SET_SELECTED_MOD";
export const SET_MODS_LIST = "SET_MODS_LIST";
export const SET_LATEST_FILES_ONLY = "SET_LATEST_FILES_ONLY";
export const SET_DIFF_FIELDS = "SET_DIFF_FIELDS";
export const SET_FILE_NAME_LIST = "SET_FILE_NAME_LIST";
export const SET_SELECTED_FILE_INFO = "SET_SELECTED_FILE_INFO";
export const SET_SELECTED_OPERATION = "SET_SELECTED_OPERATION";
export const SET_SELECTED_DIFF_FIELD = "SET_SELECTED_DIFF_FIELD";
export const SET_DIFF_FILTER_GENE_NAME = "SET_DIFF_FILTER_GENE_NAME";
export const SET_DIFF_FILTER_GENE_NAME_CS = "SET_DIFF_FILTER_GENE_NAME_CS";
export const SET_DIFF_FILTER_GENE_NAME_SUBSTR = "SET_DIFF_FILTER_GENE_NAME_SUBSTR";
export const SET_DIFF_FILTER_PHRASE = "SET_DIFF_FILTER_PHRASE";
export const SET_DIFF_FILTER_PHRASE_CS = "SET_DIFF_FILTER_PHRASE_CS";
export const FETCH_FILE_CONTENT_REQUEST = "FETCH_FILE_CONTENT_REQUEST";
export const FETCH_FILE_CONTENT_SUCCESS = "FETCH_FILE_CONTENT_SUCCESS";
export const FETCH_FILE_CONTENT_ERROR = "FETCH_FILE_CONTENT_ERROR";
export const DISMISS_FILE_LOADING_ERROR = "DISMISS_FILE_LOADING_ERROR";
export const SET_VIEW_FILTER_HAS_DATA = "SET_VIEW_FILTER_HAS_DATA";
export const SET_VIEW_ENTRIES_PER_PAGE = "SET_VIEW_ENTRIES_PER_PAGE";
export const SET_VIEW_PAGE_NUM = "SET_VIEW_PAGE_NUM";
export const SET_VIEW_FILTER_ONTOLOGY_ID = "SET_VIEW_FILTER_ONTOLOGY_ID"
export const SET_VIEW_FILTER_MIN_FINAL_EXP_GO_ID_OP = "SET_VIEW_FILTER_MIN_FINAL_EXP_GO_ID_OP";
export const SET_VIEW_FILTER_MIN_FINAL_EXP_GO_ID_COUNT = "SET_VIEW_FILTER_MIN_FINAL_EXP_GO_ID_COUNT";
export const ADD_VIEW_SELECTED_DISPLAY_FIELD = "ADD_VIEW_SELECTED_DISPLAY_FIELD";
export const REMOVE_VIEW_SELECTED_DISPLAY_FIELD = "REMOVE_VIEW_SELECTED_DISPLAY_FIELD";
export const FETCH_STATS_FILES_REQUEST = "FETCH_STATS_FILES_REQUEST";
export const FETCH_STATS_FILES_SUCCESS = "FETCH_STATS_FILES_SUCCESS";
export const FETCH_STATS_FILES_ERROR = "FETCH_STATS_FILES_ERROR";


export const fetchModsList = (selectedMod) => {
    return async dispatch => {
        let urlRoot = process.env.REACT_APP_URLROOT !== undefined ? process.env.REACT_APP_URLROOT :
            'https://reports.alliancegenome.org/';
        let urlTemplate = urlRoot;
        if (urlRoot.match(/textpresso/)) {
            urlTemplate = urlRoot + 'index.xml';
        }
        let response = await fetch(urlTemplate);
        let res = await response.text();
        let arrayFiles = res.match(/gene-descriptions[^<]*?\/\d{8}\/[^<]*?\.json/g);
        let mods = [...new Set(arrayFiles.map(arrayFile =>
            arrayFile.match(/gene-descriptions\/(.*?)\/\d{8}\/(\d{8})_([\w]*?)\.json/)[3]))];
        dispatch(setModsList(mods))
        if (selectedMod !== undefined) {
            dispatch(setSelectedMod(selectedMod));
        } else {
            dispatch(setSelectedMod(mods[0]))
        }
    }
}

export const fetchFilesFromFMS = (releaseLatest, mod) => {
    return async dispatch => {
        let fileObjects = [];
        let s3FilePaths = [];
        await Promise.all(['live', 'test'].map(async testOrLive => {
            let paths = await getS3PathsFromFms(testOrLive, mod);
            paths.forEach(path => s3FilePaths.push(path));
        }));
        let processedVersionRelease = new Set();
        s3FilePaths.sort((path1, path2) => (path1.releaseVersion + ' - ' + path1.releaseType + ' - ' +
            path1.uploadDate) < (path2.releaseVersion + ' - ' + path2.releaseType + ' - ' + path2.uploadDate) ? 1 : -1)
            .forEach(path => {
                // sort labels and process in reverse, to get most recent first
                let versionRelease = path.releaseVersion + ' - ' + path.releaseType;
                if (releaseLatest && processedVersionRelease.has(versionRelease)) {
                    return;
                }
                processedVersionRelease.add(versionRelease);	// add versionRelease to set of already added
                fileObjects.push(path);
            });
        dispatch(setFileNameList(fileObjects));
    }
}

export const fetchFileContent = (s3Path, mod, fileOrder = 0) => {
    return dispatch => {
        dispatch(fetchFileContentRequest());
        let url = generateFmsJsonUrl(s3Path, mod);
        requestAndGunzipBodyIfNecessary(url).then(res => {
            dispatch(fetchFileContentSuccess(res, fileOrder));
        }).catch(error => {
            dispatch(fetchFileContentError());
        });
    }
}

export const fetchStatsFiles = (mod) => {
    return dispatch => {
        dispatch(fetchStatsFilesRequest());
        getStatsFiles(mod).then(res => {
            dispatch(fetchStatsFilesSuccess(res.statsFile1.s3Path, JSON.stringify(res.statsFile1.content), res.statsFile1.uploadDate, res.statsFile2.s3Path, JSON.stringify(res.statsFile2.content), res.statsFile2.uploadDate));
        }).catch(error => {
            dispatch(fetchStatsFilesError());
        })
    }
}

export const fetchStatsFilesRequest = () => ({
    type: FETCH_STATS_FILES_REQUEST
});

export const fetchStatsFilesSuccess = (statsFile1S3Path, statsFile1Content, statsFile1UploadDate, statsFile2S3Path, statsFile2Content, statsFile2UploadDate) => ({
    type: FETCH_STATS_FILES_SUCCESS,
    payload: {
        statsFile1S3Path: statsFile1S3Path,
        statsFile1Content: statsFile1Content,
        statsFile1UploadDate: statsFile1UploadDate,
        statsFile2S3Path: statsFile2S3Path,
        statsFile2Content: statsFile2Content,
        statsFile2UploadDate: statsFile2UploadDate
    }
});

export const fetchStatsFilesError = () => ({
    type: FETCH_STATS_FILES_ERROR
});

export const setSelectedMod = mod => ({
    type: SET_SELECTED_MOD,
    payload: {
        mod
    }
});

export const setModsList = mods => ({
    type: SET_MODS_LIST,
    payload: {
        mods
    }
});

export const setDiffFields = diffFields => ({
    type: SET_DIFF_FIELDS,
    payload: {
        diffFields
    }
});

export const setLatestFilesOnly = latestFilesOnly => ({
    type: SET_LATEST_FILES_ONLY,
    payload: {
        latestFilesOnly
    }
});

export const setFileNameList = fileNameList => ({
    type: SET_FILE_NAME_LIST,
    payload: {
        fileNameList
    }
});

export const setSelectedFileInfo = (fileObj, idx) => ({
    type: SET_SELECTED_FILE_INFO,
    payload: {
        fileObj: fileObj,
        idx: idx
    }
});

export const setSelectedOperation = (operation) => ({
    type: SET_SELECTED_OPERATION,
    payload: { operation }
});

export const setSelectedDiffField = (diffField) => ({
    type: SET_SELECTED_DIFF_FIELD,
    payload: { diffField }
});

export const setDiffFilterGeneName = (geneName) => ({
    type: SET_DIFF_FILTER_GENE_NAME,
    payload: { geneName }
});

export const setDiffFilterGeneNameCS = (caseSensitive) => ({
    type: SET_DIFF_FILTER_GENE_NAME_CS,
    payload: { caseSensitive }
});

export const setDiffFilterGeneNameSubstr = (substring) => ({
    type: SET_DIFF_FILTER_GENE_NAME_SUBSTR,
    payload: { substring }
});

export const setDiffFilterPhrase = (phrase) => ({
    type: SET_DIFF_FILTER_PHRASE,
    payload: { phrase }
});

export const setDiffFilterPhraseCS = (caseSensitive) => ({
    type: SET_DIFF_FILTER_PHRASE_CS,
    payload: { caseSensitive }
});

export const fetchFileContentRequest = () => ({
    type: FETCH_FILE_CONTENT_REQUEST
});

export const fetchFileContentSuccess = (result, fileOrder) => ({
    type: FETCH_FILE_CONTENT_SUCCESS,
    payload: {
        result: result,
        fileOrder: fileOrder
    }
});

export const fetchFileContentError = () => ({
    type: FETCH_FILE_CONTENT_ERROR
});

export const dismissFileLoadingError = () => ({
    type: DISMISS_FILE_LOADING_ERROR
});

export const setViewFilterHasData = (viewFilterHasData) => ({
    type: SET_VIEW_FILTER_HAS_DATA,
    payload: { viewFilterHasData }
});

export const setViewEntriesPerPage = (viewEntriesPerPage) => ({
    type: SET_VIEW_ENTRIES_PER_PAGE,
    payload: { viewEntriesPerPage }
});

export const setViewPageNum = (viewPageNum) => ({
    type: SET_VIEW_PAGE_NUM,
    payload: { viewPageNum }
});

export const setViewFilterOntologyID = (viewFilterOntologyID) => ({
    type: SET_VIEW_FILTER_ONTOLOGY_ID,
    payload: { viewFilterOntologyID }
});

export const setViewFilterMinFinalExpGOIDOp = (viewFilterMinFinalExpGOIDOp) => ({
    type: SET_VIEW_FILTER_MIN_FINAL_EXP_GO_ID_OP,
    payload: { viewFilterMinFinalExpGOIDOp }
});

export const setViewFilterMinFinalExpGOIDCount = (viewFilterMinFinalExpGOIDCount) => ({
    type: SET_VIEW_FILTER_MIN_FINAL_EXP_GO_ID_COUNT,
    payload: { viewFilterMinFinalExpGOIDCount }
});

export const addViewSelectedDisplayField = (selectedDisplayField) => ({
    type: ADD_VIEW_SELECTED_DISPLAY_FIELD,
    payload: { selectedDisplayField }
});

export const removeViewSelectedDisplayField = (selectedDisplayField) => ({
    type: REMOVE_VIEW_SELECTED_DISPLAY_FIELD,
    payload: { selectedDisplayField }
});