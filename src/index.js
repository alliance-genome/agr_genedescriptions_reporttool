import React from 'react';
import ReactDOM from 'react-dom';
import store from "./redux/store";
import {Provider} from "react-redux";
import ReportTool from "./containers/Main";
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.render(
    <Provider store={store}>
      <ReportTool />
    </Provider>,
    document.getElementById('root')
);
