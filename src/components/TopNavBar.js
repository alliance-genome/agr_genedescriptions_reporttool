import React from 'react';
import {connect} from "react-redux";
import { useLocation } from 'react-router-dom'
import {Badge, Nav, Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";
import {getSelectedMod, getSelectedOperation} from "../redux/selectors";

const TopNavBar = (props) => {

    const location = useLocation();

    return (
        <Navbar sticky="top" bg="dark" variant="dark" className="px-4">
            <Navbar.Brand href="/">Gene Descriptions Report Tool</Navbar.Brand>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto" activeKey={useLocation().pathname}>
                    <Nav.Link eventKey="/mod_selection" as={Link} to="/mod_selection">1. Select MOD/Mode</Nav.Link>
                    <Nav.Link eventKey="/file_selection" as={Link} to="/file_selection">2. Select File(s)</Nav.Link>
                    <Nav.Link eventKey="/display_results" as={Link} to="/display_results">3. Display Results</Nav.Link>
                </Nav>
                <Nav>
                    <Nav.Item as={Badge} variant="success" className="px-2"><h6>Selected MOD: {props.selectedMod}</h6></Nav.Item>
                    <Nav.Item className="px-1"/>
                    {location.pathname !== "/dashboard" ? <Nav.Item as={Badge} variant="success" className="px-2"><h6>Selected Mode: {props.selectedOperation}</h6></Nav.Item> : null}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
const mapStateToProps = state => ({
    selectedMod: getSelectedMod(state),
    selectedOperation: getSelectedOperation(state)
});

export default connect(mapStateToProps, {})(TopNavBar);