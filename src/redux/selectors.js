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