import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import reportToolReducer from "./reducers";


const store = createStore(reportToolReducer, applyMiddleware(thunk));
export default store;