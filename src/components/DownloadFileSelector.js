import React from 'react';
import {connect} from "react-redux";
import {getFileNameList, getSelectedFilesInfo} from "../redux/selectors";
import {setSelectedFileInfo} from "../redux/actions";
import {Form} from "react-bootstrap";

const DownloadFileSelector = (props) => {

    return (
        <div>
            <h6>Select file to download</h6>
            <Form.Control as="select" htmlSize={props.fileNameList.length}
                          onChange={(event) => props.setSelectedFileInfo(JSON.parse(event.target.value), 0)}
                          defaultValue={JSON.stringify(props.selectedFileInfo)}>
                {props.fileNameList.map(fileObj =>
                    <option
                        value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                    </option>)}
            </Form.Control>
        </div>
    )
}

const mapStateToProps = state => ({
    selectedFileInfo: getSelectedFilesInfo(state)[0],
    fileNameList: getFileNameList(state)
});

export default connect(mapStateToProps, {setSelectedFileInfo})(DownloadFileSelector);