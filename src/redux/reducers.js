import {createReducer} from '@reduxjs/toolkit'

const initialState = {
    modsList: [],
    selectedMod: undefined,
    latestFilesOnly: true,
    diffFields: [],
    descriptionFileObjects: []
};

export default createReducer(initialState, {
    SET_SELECTED_MOD: (state, action) => {
        if (action.payload.mod !== undefined) {
            state.selectedMod = action.payload.mod;
        }
    },
    SET_MODS_LIST: (state, action) => {
        if (action.payload.mods !== undefined) {
            state.modsList = [...action.payload.mods];
            if (state.modsList.length > 0) {
                state.selectedMod = state.modsList[0];
            }
        }
    },
    SET_LATEST_FILES_ONLY: (state, action) => {
        if (action.payload.latestFilesOnly !== undefined) {
            state.latestFilesOnly = action.payload.latestFilesOnly;
        }
    },
    SET_DIFF_FIELDS: (state, action) => {
        if (action.payload.diffFields !== undefined) {
            state.diffFields = action.payload.diffFields;
        }
    },
    SET_DESCRIPTION_FILE_OBJECTS: (state, action) => {
        state.descriptionFileObjects = action.payload.descriptionFileObjects;
    }
});