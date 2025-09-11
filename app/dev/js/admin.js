import {addFilter} from '@wordpress/hooks';
import {Fragment} from '@wordpress/element';
import {InspectorControls} from '@wordpress/block-editor';
import {__experimentalGrid as Grid, PanelBody, ToggleControl} from '@wordpress/components';
import {googleMaterialSymbols} from 'Includes/helper'

import {WPBS_Google_Places} from "Modules/google-places";

WPBS_Google_Places.init();

googleMaterialSymbols();

addFilter(
    'blocks.registerBlockType',
    'wpbs/extend-gf-block',
    (settings, name) => {
        if (name !== 'gravityforms/form') {
            return settings;
        }

        // Add a new attribute
        settings.attributes = {
            ...settings.attributes,
            collapseOnMobile: {
                type: 'boolean',
                default: false,
            },
        };

        // Wrap edit to inject our control
        const oldEdit = settings.edit;
        settings.edit = (props) => {
            const {attributes, setAttributes} = props;

            return (
                <Fragment>
                    <InspectorControls>
                        <PanelBody title={'Mobile'}>
                            <Grid columns={2} columnGap={15} rowGap={20} style={{paddingTop: '15px'}}>
                                <ToggleControl
                                    label="Collapse"
                                    checked={!!attributes.collapseOnMobile}
                                    onChange={(value) => setAttributes({collapseOnMobile: value})}
                                />

                            </Grid>
                        </PanelBody>
                    </InspectorControls>
                    {oldEdit(props)}
                </Fragment>
            );
        };

        return settings;
    }
);