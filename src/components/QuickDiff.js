import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux'
import {getSelectedMod, getStatsFiles, getStatsFilesAreLoading} from "../redux/selectors";
import {fetchStatsFiles} from "../redux/actions";
import {Badge, Button, Col, Container, Row, Spinner, Table} from "react-bootstrap";


const QuickDiff = ({selectedMod, statsFiles, statsFilesAreLoading, fetchStatsFiles}) => {

    const [statsFile1Content, setStatsFile1Content] = useState(undefined);
    const [statsFile2Content, setStatsFile2Content] = useState(undefined);

    useEffect(() => {
        if (selectedMod !== undefined) {
            fetchStatsFiles(selectedMod);
        }
    }, [selectedMod]);

    useEffect(() => {
        if (statsFiles.statsFile1Content !== undefined) {
            setStatsFile1Content(JSON.parse(statsFiles.statsFile1Content));
        }
        if (statsFiles.statsFile2Content !== undefined) {
            setStatsFile2Content(JSON.parse(statsFiles.statsFile2Content));
        }
    }, [statsFiles]);

    return (
        <>
            {statsFilesAreLoading ?
                <Spinner animation="grow" />
                :
                <div>
                    {statsFile1Content !== undefined && statsFile2Content !== undefined ?
                        <Table striped bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>&nbsp;</th>
                                <th>Previous Release ({statsFiles.statsFile1S3Path.split('/')[0]})</th>
                                <th>Latest File ({statsFiles.statsFile2S3Path.split('/')[0]})</th>
                                <th>Difference</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th>Genes</th>
                                <th>{statsFile1Content.total_number_of_genes}</th>
                                <th>{statsFile2Content.total_number_of_genes}</th>
                                <th><Badge variant={statsFile2Content.total_number_of_genes - statsFile1Content.total_number_of_genes >= 0 ? "success" : "danger"}>{statsFile2Content.total_number_of_genes - statsFile1Content.total_number_of_genes}</Badge></th>
                            </tr>
                            <tr>
                                <th>Descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_description - statsFile1Content.number_genes_with_non_null_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_description - statsFile1Content.number_genes_with_non_null_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>GO descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_go_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_go_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_go_description - statsFile1Content.number_genes_with_non_null_go_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_go_description - statsFile1Content.number_genes_with_non_null_go_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>GO function descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_go_function_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_go_function_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_go_function_description - statsFile1Content.number_genes_with_non_null_go_function_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_go_function_description - statsFile1Content.number_genes_with_non_null_go_function_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>GO process descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_go_process_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_go_process_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_go_process_description - statsFile1Content.number_genes_with_non_null_go_process_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_go_process_description - statsFile1Content.number_genes_with_non_null_go_process_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>GO component descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_go_component_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_go_component_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_go_component_description - statsFile1Content.number_genes_with_non_null_go_component_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_go_component_description - statsFile1Content.number_genes_with_non_null_go_component_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>DO descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_do_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_do_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_do_description - statsFile1Content.number_genes_with_non_null_do_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_do_description - statsFile1Content.number_genes_with_non_null_do_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>DO experimental descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_do_experimental_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_do_experimental_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_do_experimental_description - statsFile1Content.number_genes_with_non_null_do_experimental_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_do_experimental_description - statsFile1Content.number_genes_with_non_null_do_experimental_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>DO biomarker descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_do_biomarker_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_do_biomarker_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_do_biomarker_description - statsFile1Content.number_genes_with_non_null_do_biomarker_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_do_biomarker_description - statsFile1Content.number_genes_with_non_null_do_biomarker_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>DO orthology descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_do_orthology_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_do_orthology_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_do_orthology_description - statsFile1Content.number_genes_with_non_null_do_orthology_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_do_orthology_description - statsFile1Content.number_genes_with_non_null_do_orthology_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>Tissue Expression descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_tissue_expression_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_tissue_expression_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_tissue_expression_description - statsFile1Content.number_genes_with_non_null_tissue_expression_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_tissue_expression_description - statsFile1Content.number_genes_with_non_null_tissue_expression_description}</Badge></th>
                            </tr>
                            <tr>
                                <th>Orthology descriptions</th>
                                <th>{statsFile1Content.number_genes_with_non_null_orthology_description}</th>
                                <th>{statsFile2Content.number_genes_with_non_null_orthology_description}</th>
                                <th><Badge variant={statsFile2Content.number_genes_with_non_null_orthology_description - statsFile1Content.number_genes_with_non_null_orthology_description >= 0 ? "success" : "danger"}>{statsFile2Content.number_genes_with_non_null_orthology_description - statsFile1Content.number_genes_with_non_null_orthology_description}</Badge></th>
                            </tr>
                            </tbody>
                        </Table>
                    : null}
                </div>
            }
        </>
    );
}

const mapStateToProps = state => ({
    selectedMod: getSelectedMod(state),
    statsFiles: getStatsFiles(state),
    statsFilesAreLoading: getStatsFilesAreLoading(state)
});

export default connect(mapStateToProps, {fetchStatsFiles})(QuickDiff)