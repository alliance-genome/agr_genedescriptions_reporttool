import { connect } from 'react-redux'
import '../index.css';
import {getHtmlVar} from "../lib";
import React, {useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import {fetchFilesFromFMS, fetchModsList} from "../redux/actions";
import SelectModAndOperation from "./SelectModAndOperation";
import SelectFiles from "./SelectFiles";
import {getLatestFilesOnly, getSelectedMod} from "../redux/selectors";
import DisplayResults from "./DisplayResults";
import TopNavBar from "../components/TopNavBar";
import {Nav, Navbar} from "react-bootstrap";

const Main = (props) => {

    useEffect(() => {
        props.fetchModsList(getHtmlVar().get('mod'));
    }, [])

    useEffect(() => {
        if (props.selectedMod) {
            props.fetchFilesFromFMS(props.latestFilesOnly, props.selectedMod);
        }
    }, [props.selectedMod, props.latestFilesOnly]);


    return (
        <Router>
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
                    <SelectModAndOperation />
                </Route>
            </Switch>
        </Router>
    );
}

const mapStateToProps = state => ({
    selectedMod: getSelectedMod(state),
    latestFilesOnly: getLatestFilesOnly(state)
});

export default connect(mapStateToProps, {fetchModsList, fetchFilesFromFMS})(Main)