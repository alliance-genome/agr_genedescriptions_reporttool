import React, {Component} from 'react';
import {connect} from "react-redux";
import {getLatestFilesOnly, getModsList, getSelectedMod} from "../redux/selectors";
import {setLatestFilesOnly, setSelectedMod} from "../redux/actions";

class ModSelector extends Component {
    render() {
        return (
            <div id='div_section_mod'>
                <label>
                    <h3>Select your Mod:</h3>
                    <select name="mod" id="mod" size={this.props.modsList.size} defaultValue="" onChange={(event) => this.props.setSelectedMod(event.target.value)}>
                        {[...this.props.modsList].map(mod => <option key={mod} value={mod}>{mod}</option>)}
                    </select>
                </label><br/>
                <label>
                    <input
                        type="radio"
                        name="releaseLatest"
                        value="true"
                        onChange={() => this.props.setLatestFilesOnly(true)}
                        checked={this.props.latestFilesOnly}
                    />
                    Latest file for a given version and release type
                </label><br/>
                <label>
                    <input
                        type="radio"
                        name="releaseLatest"
                        value="false"
                        onChange={() => this.props.setLatestFilesOnly(false)}
                        checked={!this.props.latestFilesOnly}
                    />
                    All Files
                </label><br/><br/>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    modsList: getModsList(state),
    selectedMod: getSelectedMod(state),
    latestFilesOnly: getLatestFilesOnly(state),
});

export default connect(mapStateToProps, {setSelectedMod, setLatestFilesOnly})(ModSelector);