import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {getSelectedFilesInfo, getSelectedMod} from "../redux/selectors";
import {generateFmsJsonUrl} from "../lib";
import {Col, Container, Row} from "react-bootstrap";

const DownloadFileViewer = (props) => {

    const [downloadLinkUrl, setDownloadLinkUrl] = useState('');
    const [downloadLinkText, setDownloadLinkText] = useState('');
    const [showError, setShowError] = useState(true);

    useEffect(() => {
        if (props.selectedFileInfo !== undefined && props.selectedMod !== undefined) {
            setShowError(false);
            let urlDownload = generateFmsJsonUrl(props.selectedFileInfo.s3Path, props.selectedMod);
            let filename = props.selectedFileInfo.uploadDate + '_' + props.selectedMod + '.json';
            let downloadLink = document.createElement("a");
            downloadLink.setAttribute( 'href', urlDownload );
            downloadLink.setAttribute( 'target', '_blank' );
            downloadLink.setAttribute( 'download', filename );
            let downloadText = 'download ' + filename;
            downloadLink.innerHTML = downloadText;
            setDownloadLinkUrl(urlDownload);
            downloadText = urlDownload;
            setDownloadLinkText(downloadText);
        }
    }, [props.selectedFileInfo]);

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <h5>Download File</h5>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                {showError ? 'File not selected' :
                    <a href={downloadLinkUrl}>{downloadLinkText}</a>}
                </Col>
            </Row>
        </Container>

    );
}

const mapStateToProps = state => ({
    selectedFileInfo: getSelectedFilesInfo(state)[0],
    selectedMod: getSelectedMod(state)
});

export default connect(mapStateToProps, {})(DownloadFileViewer);