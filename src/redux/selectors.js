import {initialDiffFelds} from "./reducers";

export const getSelectedMod = store => store ? store.selectedMod : undefined;
export const getModsList = store => store ? store.modsList : [];
export const getLatestFilesOnly = store => store ? store.latestFilesOnly : true;
export const getDiffFields = store => store ? store.diffFields : initialDiffFelds;
export const getFileNameList = store => store ? store.fileNameList : [];
export const getSelectedFilesInfo = store => store ? store.selectedFilesInfo : [undefined, undefined];
export const getSelectedOperation = store => store ? store.selectedOperation : 'diff';
export const getSelectedDiffField = store => store ? store.selectedDiffField : 'description';
export const getDiffFilterGeneName = store => store ? store.diffFilterGeneName : '';
export const getDiffFilterGeneNameCS = store => store ? store.diffFilterGeneNameCS : false;
export const getDiffFilterGeneNameSubstr = store => store ? store.diffFilterGeneNameSubstr : false;
export const getDiffFilterPhrase = store => store ? store.diffFilterPhrase : '';
export const getDiffFilterPhraseCS = store => store ? store.diffFilterPhraseCS : false;
export const getFilesContent = store => store ? store.descriptionFilesContent : [undefined, undefined];
export const getViewFilterHasData = store => store ? store.viewFilterHasData : false;
export const getViewEntriesPerPage = store => store ? store.viewEntriesPerPage : 100;
export const getViewPageNum = store => store ? store.viewPageNum : 1;
export const getViewFilterOntologyID = store => store ? store.viewFilterOntologyID : '';
export const getViewFilterMinFinalExpGOIDOp = store => store ? store.viewFilterMinFinalExpGOIDOp : '>=';
export const getViewFilterMinFinalExpGOIDCount = store => store ? store.viewFilterMinFinalExpGOIDCount : 0;
export const areFilesContentCurrent = store => store ? store.selectedFilesInfo[0] === store.currentFilesContentInfo[0] && store.selectedFilesInfo[1] === store.currentFilesContentInfo[1] : false;
export const getViewSelectedDisplayFields = store => store ? store.viewSelectedDisplayFields : new Set();
export const getFileLoadingError = store => store ? store.fileLoadingError : false;
export const getStatsFilesAreLoading = store => store ? store.statsFilesAreLoading : false;
export const getStatsFilesError = store => store ? store.statsFilesError : false;
export const getStatsFiles = store => store ? {statsFile1S3Path: store.statsFile1S3Path, statsFile1Content: store.statsFile1Content, statsFile1UploadDate: store.statsFile2UploadDate, statsFile2S3Path: store.statsFile2S3Path, statsFile2Content: store.statsFile2Content, statsFile2UploadDate: store.statsFile2UploadDate} : {statsFile1S3Path: undefined, statsFile1Content: undefined, statsFile1UploadDate: undefined, statsFile2S3Path: undefined, statsFile2Content: undefined, statsFile2UploadDate: undefined}