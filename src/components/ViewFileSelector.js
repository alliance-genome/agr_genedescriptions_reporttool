import React from 'react';
import {connect} from "react-redux";
import {
    setDiffFilterGeneName,
    setDiffFilterGeneNameCS,
    setDiffFilterGeneNameSubstr,
    setDiffFilterPhrase,
    setDiffFilterPhraseCS,
    setSelectedDiffField,
    setSelectedFileInfo,
    setViewEntriesPerPage,
    setViewFilterHasData, setViewFilterMinFinalExpGOIDCount, setViewFilterMinFinalExpGOIDOp, setViewFilterOntologyID,
    setViewPageNum
} from "../redux/actions";
import {
    getDiffFields,
    getDiffFilterGeneName,
    getDiffFilterGeneNameCS,
    getDiffFilterGeneNameSubstr,
    getDiffFilterPhrase,
    getDiffFilterPhraseCS,
    getFileNameList,
    getViewEntriesPerPage,
    getViewFilterHasData,
    getViewFilterMinFinalExpGOIDCount, getViewFilterMinFinalExpGOIDOp,
    getViewFilterOntologyID,
    getViewPageNum
} from "../redux/selectors";

const ViewFileSelector = (props) => {

    const handleInputChangeCheckboxDiffFields = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        let checkboxDiffFieldsValue = props.selectedDiffField;
        let checkboxFieldName = name.replace("checkbox_", "");
        let lowercaseCheckboxFieldName = checkboxFieldName.toLowerCase();
        checkboxDiffFieldsValue[lowercaseCheckboxFieldName] = value;
        props.setSelectedDiffField(checkboxDiffFieldsValue);
    }

    return (
        <div>
            <label id='anchor2Ccontrol'>
                Select file to view:<br/>
                <select name="dateLoad" id="dateLoad" size={props.fileNameList.length} onChange={(event) => {
                    props.setSelectedFileInfo(JSON.parse(event.target.value), 0);
                    props.setSelectedFileInfo(undefined, 1)
                }}>
                    {props.fileNameList.map(fileObj =>
                        <option
                            key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                            value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                        </option>)}
                </select>
            </label>
            <br />
            <br />
            <label>
                Which fields to display : <br />
            </label>
            {props.diffFields.map(function(item){
                let name = 'checkbox_' + item;
                let label_key = 'label_key_' + item;
                return (
                    <label key={label_key}>
                        <input
                            name={name}
                            type="checkbox"
                            checked={props.diffFields[item]}
                            onChange={handleInputChangeCheckboxDiffFields}
                        />{props.diffFields[item]}<br/>
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
                    checked={props.viewFilterHasData}
                    onChange={(e) => props.setViewFilterHasData(e.target.checked)} />
                Has Data<br/>
            </label>
            <label>
                <input
                    name="checkboxHasNoData"
                    type="checkbox"
                    checked={!props.viewFilterHasData}
                    onChange={(e) => props.setViewFilterHasData(e.target.checked)} />
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
                    value={props.viewEntriesPerPage}
                    onChange={(e) => props.setViewEntriesPerPage(e.target.value)} />
            </label>
            <br />
            <label>
                Page number :
                <input
                    name="pageNumber"
                    id="pageNumber"
                    type="number"
                    size="5"
                    value={props.viewPageNum}
                    onChange={(e) => props.setViewPageNum(e.target.value)} />
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
                    value={props.diffFilterGeneName}
                    onChange={(e) => props.setDiffFilterGeneName(e.target.value)} /><br/>
                <input
                    name="checkboxLoadGeneNameFilter"
                    type="checkbox"
                    checked={props.diffFilterGeneNameCS}
                    onChange={(e) => props.setDiffFilterGeneNameCS(e.target.checked)} />
                Case sensitive<br/>
                <input
                    name="checkboxLoadGeneNameSubstring"
                    type="checkbox"
                    checked={props.diffFilterGeneNameSubstr}
                    onChange={(e) => props.setDiffFilterGeneNameSubstr(e.target.value)} />
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
                    value={props.diffFilterPhrase}
                    onChange={(e) => props.setDiffFilterPhrase(e.target.value)} /><br/>
                <input
                    name="checkboxLoadKeywordFilter"
                    type="checkbox"
                    checked={props.diffFilterPhraseCS}
                    onChange={(e) => props.setDiffFilterPhraseCS(e.target.checked)} />
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
                    value={props.viewFilterOntologyID}
                    onChange={(e) => props.setViewFilterOntologyID(e.target.value)} /><br/>
            </label>
            <br />
            <label>
                Count of set_final_experimental_go_ids
                <select name="loadComparisonGoids" id="loadComparisonGoids" size="1" value={props.viewFilterMinFinalExpGOIDOp}
                        onChange={(e) => props.setViewFilterMinFinalExpGOIDOp(e.target.value)}>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                    <option value="==">==</option>
                </select>
                <input
                    name="loadGoidsCount"
                    id="loadGoidsCount"
                    type="number"
                    size="5"
                    value={props.viewFilterMinFinalExpGOIDCount}
                    onChange={(e) => props.setViewFilterMinFinalExpGOIDCount(e.target.value)} />
            </label>
            <br />
        </div>
    );
}

const mapStateToProps = state => ({
    diffFields: getDiffFields(state),
    fileNameList: getFileNameList(state),
    viewFilterHasData: getViewFilterHasData(state),
    viewEntriesPerPage: getViewEntriesPerPage(state),
    viewPageNum: getViewPageNum(state),
    viewFilterOntologyID: getViewFilterOntologyID(state),
    viewFilterMinFinalExpGOIDOp: getViewFilterMinFinalExpGOIDOp(state),
    viewFilterMinFinalExpGOIDCount: getViewFilterMinFinalExpGOIDCount(state),
    diffFilterGeneName: getDiffFilterGeneName(state),
    diffFilterGeneNameCS: getDiffFilterGeneNameCS(state),
    diffFilterGeneNameSubstr: getDiffFilterGeneNameSubstr(state),
    diffFilterPhrase: getDiffFilterPhrase(state),
    diffFilterPhraseCS: getDiffFilterPhraseCS(state)
});

export default connect(mapStateToProps, {setSelectedDiffField, setSelectedFileInfo, setViewFilterHasData,
    setViewEntriesPerPage, setViewPageNum, setDiffFilterGeneName, setDiffFilterGeneNameCS, setDiffFilterGeneNameSubstr,
    setDiffFilterPhrase, setDiffFilterPhraseCS, setViewFilterOntologyID, setViewFilterMinFinalExpGOIDOp,
    setViewFilterMinFinalExpGOIDCount})(ViewFileSelector);