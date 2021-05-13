import { connect } from 'react-redux'
import '../index.css';
import {getHtmlVar} from "../lib";
import React, {useEffect} from 'react';
import {Switch, Route, Redirect, useLocation} from 'react-router-dom';
import {fetchFilesFromFMS, fetchModsList, setSelectedMod} from "../redux/actions";
import SelectModAndOperation from "./SelectModAndOperation";
import SelectFiles from "./SelectFiles";
import {getLatestFilesOnly, getSelectedMod} from "../redux/selectors";
import DisplayResults from "./DisplayResults";
import TopNavBar from "../components/TopNavBar";
import queryString from 'query-string';


const Main = (props) => {

    const location = useLocation();

    useEffect(() => {
        if (location.search !== undefined) {
            let params = queryString.parse(location.search)
            if ('mod' in params) {
                props.fetchModsList(params.mod);
                return
            }
        }
        props.fetchModsList();

    }, [])

    useEffect(() => {
        if (props.selectedMod) {
            props.fetchFilesFromFMS(props.latestFilesOnly, props.selectedMod);
        }
    }, [props.selectedMod, props.latestFilesOnly]);


    return (
        <>
            <TopNavBar />
            <Switch>
                <Route path="/mod_selection">
                    <SelectModAndOperation />
                </Route>
                <Route path="/file_selection">
                    <SelectFiles />
                </Route>
                <Route path="/display_results">
                    <DisplayResults />
                </Route>
                <Route path="/">
                    <Redirect to={{ pathname: "/mod_selection", search: location.search}} />
                </Route>
            </Switch>
        </>
    );
}

const mapStateToProps = state => ({
    selectedMod: getSelectedMod(state),
    latestFilesOnly: getLatestFilesOnly(state)
});

export default connect(mapStateToProps, {fetchModsList, fetchFilesFromFMS, setSelectedMod})(Main)