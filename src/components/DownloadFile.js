import React, {useState} from 'react';
import {connect} from "react-redux";
import {generateFmsJsonUrl} from "../lib";
import {getFileNameList, getSelectedFilesInfo} from "../redux/selectors";
import {setSelectedFileInfo} from "../redux/actions";

const DownloadFile = (props) => {

    const [downloadLinkUrl, setDownloadLinkUrl] = useState('');
    const [downloadLinkText, setDownloadLinkText] = useState('');
    const [showDownloadLink, setShowDownloadLink] = useState(false);

    const handleSubmitGenerateLink = () => {
        let errorMessage = '';
        if (props.selectedFilesInfo === undefined) { errorMessage += 'Choose a file\n';  }
        if (props.selectedMod === undefined) { errorMessage += 'Choose a mod\n';  }
        if (errorMessage !== '') { alert(errorMessage); return; }
        let urlDownload = generateFmsJsonUrl(props.filesContent.s3Path, props.selectedMod);

        let filename = props.selectedFilesInfo.uploadDate + '_' + props.selectedMod + '.json';
        let downloadLink = document.createElement("a");
        downloadLink.setAttribute( 'href', urlDownload );
        downloadLink.setAttribute( 'target', '_blank' );
        downloadLink.setAttribute( 'download', filename );
        let downloadText = 'download ' + filename;
        downloadLink.innerHTML = downloadText;
        setDownloadLinkUrl(urlDownload);
        downloadText = urlDownload;
        setDownloadLinkText(downloadText);
        setShowDownloadLink(true);
    }

    const handleSubmitOpenTab = (event) => {
        event.preventDefault();
        let errorMessage = '';
        if (props.selectedFilesInfo === undefined) { errorMessage += 'Choose a file\n';  }
        if (props.selectedMod === undefined) { errorMessage += 'Choose a mod\n';  }
        if (errorMessage !== '') { alert(errorMessage); return; }
        let urlDownload = generateFmsJsonUrl(props.selectedFilesInfo.s3Path, props.selectedMod);
        window.open(urlDownload);
    }

    return (
        <div>
            <h3>Download a file</h3>
            <label id='anchor2Bcontrol'>
                Select file to download:<br/>
                <select name="dateDownload" id="dateDownload" size={props.fileNameList.length} onChange={(event) => props.setSelectedFileInfo(JSON.parse(event.target.value), 0)}>
                    {props.fileNameList.map(fileObj =>
                        <option
                            key={fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                            value={JSON.stringify(fileObj)}>{fileObj.releaseVersion + ' - ' + fileObj.releaseType + ' - ' + fileObj.uploadDate}
                        </option>)}
                </select>
            </label>
            <br />
            <input type="button" value="Open JSON in new tab" onClick={handleSubmitOpenTab}/> After it loads, you can save it.<br/>
            <input type="button" value="Generate JSON link" onClick={handleSubmitGenerateLink}/> You can right-click and save it, instead of waiting for it to load.<br/><br/>
            <label>
                <div
                    style={{display: showDownloadLink ? 'block' : 'none'}}
                    name="div_link_to_json"
                    id="div_link_to_json" >
                    <a target='_blank' href={downloadLinkUrl} style={{textDecoration: 'none'}}>{downloadLinkText}</a>
                </div>
            </label>
        </div>
    )
}

const mapStateToProps = state => ({
    selectedFileInfo: getSelectedFilesInfo(state)[0],
    fileNameList: getFileNameList(state)
});

export default connect(mapStateToProps, {setSelectedFileInfo})(DownloadFile);