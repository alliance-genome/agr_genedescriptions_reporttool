import {getS3PathsFromFms} from "../lib";

export const SET_SELECTED_MOD = "SET_SELECTED_MOD";
export const SET_MODS_LIST = "SET_MODS_LIST";
export const SET_LATEST_FILES_ONLY = "SET_LATEST_FILES_ONLY";
export const SET_DIFF_FIELDS = "SET_DIFF_FIELDS";
export const SET_DESCRIPTION_FILE_OBJECTS = "SET_DESCRIPTION_FILE_OBJECTS";


export const fetchModsList = () => {
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
        dispatch(setModsList(arrayFiles.map(arrayFile =>
            arrayFile.match(/gene-descriptions\/(.*?)\/\d{8}\/(\d{8})_([\w]*?)\.json/)[3])));
        let checkboxDiffFields = [];
        for (let diffField in res.diffFields) {
            checkboxDiffFields[diffField] = true;
        }
        dispatch(setDiffFields(checkboxDiffFields));
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
        dispatch(setDescriptionFileObjects(fileObjects));
    }
}

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

export const setDescriptionFileObjects = descriptionFileObjects => ({
    type: SET_DESCRIPTION_FILE_OBJECTS,
    payload: {
        descriptionFileObjects
    }
});
