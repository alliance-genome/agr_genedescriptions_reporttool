import React from 'react';
import {connect} from "react-redux";
import {getSelectedOperation} from "../redux/selectors";
import {ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import {setSelectedOperation} from "../redux/actions";


const OperationSelector = (props) => {

    return (
        <div>
            <ToggleButtonGroup type="radio"  name="options" defaultValue={props.selectedOperation === 'diff' ? 1 : props.selectedOperation === 'download' ? 2 : 3}>
                <ToggleButton variant="outline-secondary" value={1} onClick={() => props.setSelectedOperation('diff')}>Compare Files</ToggleButton>
                <ToggleButton variant="outline-secondary" value={2} onClick={() => props.setSelectedOperation('download')}>Download File</ToggleButton>
                <ToggleButton variant="outline-secondary" value={3} onClick={() => props.setSelectedOperation('view')}>View File</ToggleButton>
            </ToggleButtonGroup>
        </div>
    )
}

const mapStateToProps = state => ({
  selectedOperation: getSelectedOperation(state)
});

export default connect(mapStateToProps, {setSelectedOperation})(OperationSelector)