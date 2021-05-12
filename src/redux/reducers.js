import {createReducer} from '@reduxjs/toolkit'

export const initialDiffFelds = [
    { name: 'description', label: "Description (Full)" },
    { name: 'do_description', label: "DO Description" },
    { name: 'go_description', label: "GO Description" },
    { name: 'orthology_description', label: "Orthology Description" },
    { name: 'tissue_expression_description', label: "Expression Description" }
];


const initialState = {
    modsList: [],
    selectedMod: undefined,
    latestFilesOnly: true,
    diffFields: initialDiffFelds,
    fileNameList: [],
    selectedFilesInfo: [undefined, undefined],
    selectedOperation: 'diff',
    selectedDiffField: 'description',
    diffFilterGeneName: '',
    diffFilterGeneNameCS: false,
    diffFilterGeneNameSubstr: false,
    diffFilterPhrase: '',
    diffFilterPhraseCS: false,
    fileLoading: false,
    descriptionFilesContent: [undefined, undefined],
    fileLoadingError: false,
    viewFilterHasData: false,
    viewEntriesPerPage: 100,
    viewPageNum: 1,
    viewFilterOntologyID: '',
    viewFilterMinFinalExpGOIDOp: '>=',
    viewFilterMinFinalExpGOIDCount: 0,
    currentFilesContentInfo: [undefined, undefined]
};

export default createReducer(initialState, {
    SET_SELECTED_MOD: (state, action) => {
        if (action.payload.mod !== undefined && state.selectedMod !== action.payload.mod) {
            state.selectedMod = action.payload.mod;
            state.selectedFilesInfo = [undefined, undefined]
            state.filesContent = [undefined, undefined]
        }
    },
    SET_MODS_LIST: (state, action) => {
        if (action.payload.mods !== undefined) {
            state.modsList = [...action.payload.mods];
        }
    },
    SET_LATEST_FILES_ONLY: (state, action) => {
        if (action.payload.latestFilesOnly !== undefined) {
            state.latestFilesOnly = action.payload.latestFilesOnly;
        }
    },
    SET_DIFF_FIELDS: (state, action) => {
        if (action.payload.diffFields !== undefined) {
            state.diffFields = action.payload.diffFields;
        }
    },
    SET_FILE_NAME_LIST: (state, action) => {
        state.fileNameList = action.payload.fileNameList;
    },
    SET_SELECTED_FILE_INFO: (state, action) => {
        state.selectedFilesInfo[action.payload.idx] = action.payload.fileObj;
    },
    SET_SELECTED_OPERATION: (state, action) => {
        state.selectedOperation = action.payload.operation;
    },
    SET_SELECTED_DIFF_FIELD: (state, action) => {
        state.selectedDiffField = action.payload.diffField;
    },
    SET_DIFF_FILTER_GENE_NAME: (state, action) => {
        state.diffFilterGeneName = action.payload.geneName;
    },
    SET_DIFF_FILTER_GENE_NAME_CS: (state, action) => {
        state.diffFilterGeneNameCS = action.payload.caseSensitive;
    },
    SET_DIFF_FILTER_GENE_NAME_SUBSTR: (state, action) => {
        state.diffFilterGeneNameSubstr = action.payload.substring;
    },
    SET_DIFF_FILTER_PHRASE: (state, action) => {
        state.diffFilterPhrase = action.payload.phrase;
    },
    SET_DIFF_FILTER_PHRASE_CS: (state, action) => {
        state.diffFilterPhraseCS = action.payload.caseSensitive;
    },
    FETCH_FILE_CONTENT_REQUEST: (state, action) => {
        state.fileLoading = true;
        state.descriptionFilesContent = [undefined, undefined];
        state.fileLoadingError = false;
    },
    FETCH_FILE_CONTENT_SUCCESS: (state, action) => {
        state.descriptionFilesContent[action.payload.fileOrder] = action.payload.result;
        state.currentFilesContentInfo[action.payload.fileOrder] = state.selectedFilesInfo[action.payload.fileOrder];
        state.fileLoading = false;
        state.fileLoadingError = false;
    },
    FETCH_FILE_CONTENT_ERROR: (state, action) => {
        state.fileLoading = false;
        state.fileLoadingError = true;
    },
    DISMISS_FILE_LOADING_ERROR: (state, action) => {
        state.fileLoadingError = false;
    },
    SET_VIEW_FILTER_HAS_DATA: (state, action) => {
        state.viewFilterHasData = action.payload.viewFilterHasData;
    },
    SET_VIEW_ENTRIES_PER_PAGE: (state, action) => {
        state.viewEntriesPerPage = action.payload.viewEntriesPerPage;
    },
    SET_VIEW_PAGE_NUM: (state, action) => {
        state.viewPageNum = action.payload.viewPageNum;
    },
    SET_VIEW_FILTER_ONTOLOGY_ID: (state, action) => {
        state.viewFilterOntologyID = action.payload.viewFilterOntologyID;
    },
    SET_VIEW_FILTER_MIN_FINAL_EXP_GO_ID_OP: (state, action) => {
        state.viewFilterMinFinalExpGOIDOp = action.payload.viewFilterMinFinalExpGOIDOp;
    },
    SET_VIEW_FILTER_MIN_FINAL_EXP_GO_ID_COUNT: (state, action) => {
        state.viewFilterMinFinalExpGOIDCount = action.payload.viewFilterMinFinalExpGOIDCount;
    },
});