import {addFilter} from '@wordpress/hooks';
import {Fragment} from '@wordpress/element';
import {InspectorControls} from '@wordpress/block-editor';
import {__experimentalGrid as Grid, PanelBody, ToggleControl} from '@wordpress/components';

import {WPBS_Google_Places} from "Modules/google-places";

WPBS_Google_Places.init();


document.addEventListener('DOMContentLoaded', () => {

    jQuery(() => {

        const code_fields = document.querySelectorAll('.divlabs-script-field textarea');

        if (!code_fields.length) {
            return;
        }

        const settings = wp.codeEditor.defaultSettings
            ? _.clone(wp.codeEditor.defaultSettings)
            : {};

        settings.codemirror = Object.assign({}, settings.codemirror, {
            mode: 'text/javascript',
            lineNumbers: true,
            indentUnit: 2,
            tabSize: 2,
        });

        jQuery('body').on('focus', '.divlabs-script-field textarea', function () {
            if (jQuery(this).siblings('.CodeMirror').length) {
                return;
            }
            wp.codeEditor.initialize(jQuery(this).get(0), settings);
        });

    });

});


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