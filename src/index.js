import React from 'react';
import ReactDOM from 'react-dom';
import store from "./redux/store";
import {Provider} from "react-redux";
import ReportTool from "./containers/Main";
import {BrowserRouter as Router} from 'react-router-dom';
import { history } from './lib';
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <ReportTool />
        </Router>
    </Provider>,
    document.getElementById('root')
);
