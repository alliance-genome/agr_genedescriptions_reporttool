export const SET_SELECTED_MOD = "SET_SELECTED_MOD";
export const SET_MODS_LIST = "SET_MODS_LIST";
export const SET_LATEST_FILES_ONLY = "SET_LATEST_FILES_ONLY";

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

export const setLatestFilesOnly = latestFilesOnly => ({
    type: SET_LATEST_FILES_ONLY,
    payload: {
        latestFilesOnly
    }
});