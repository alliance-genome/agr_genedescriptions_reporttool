import React from 'react';
import {connect} from "react-redux";
import {getLatestFilesOnly, getModsList} from "../redux/selectors";
import {setLatestFilesOnly, setSelectedMod} from "../redux/actions";

const ModSelector = (props) => {
    return (
        <div id='div_section_mod'>
            <label>
                <h3>Select your Mod:</h3>
                <select name="mod" id="mod" size={props.modsList.size} defaultValue=""
                        onChange={(event) => props.setSelectedMod(event.target.value)}>
                    {[...props.modsList].map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
            </label><br/>
            <label>
                <input
                    type="radio"
                    name="releaseLatest"
                    value="true"
                    onChange={() => props.setLatestFilesOnly(true)}
                    checked={props.latestFilesOnly}
                />
                Latest file for a given version and release type
            </label><br/>
            <label>
                <input
                    type="radio"
                    name="releaseLatest"
                    value="false"
                    onChange={() => props.setLatestFilesOnly(false)}
                    checked={!props.latestFilesOnly}
                />
                All Files
            </label><br/><br/>
        </div>
    )
}

const mapStateToProps = state => ({
    modsList: getModsList(state),
    latestFilesOnly: getLatestFilesOnly(state),
});

export default connect(mapStateToProps, {setSelectedMod, setLatestFilesOnly})(ModSelector);