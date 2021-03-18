import {createReducer} from '@reduxjs/toolkit'
import _ from "lodash";

const initialState = {
    modsList: [],
    selectedMod: undefined,
    latestFilesOnly: true
};

export default createReducer(initialState, {
    SET_SELECTED_MOD: (state, action) => {
        if (action.payload.mod !== undefined) {
            state.selectedMod = action.payload.mod
        }
    },
    SET_MODS_LIST: (state, action) => {
        if (action.payload.mods !== undefined) {
            state.modsList = action.payload.mods
        }
    },
    SET_LATEST_FILES_ONLY: (state, action) => {
        if (action.payload.latestFilesOnly !== undefined) {
            state.latestFilesOnly = action.payload.latestFilesOnly
        }
    }
});