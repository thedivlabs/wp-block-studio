import "./scss/block.scss";

import {
    useBlockProps,
    InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback, useMemo} from "react";
import {useSelect} from "@wordpress/data";
import {
    __experimentalBorderControl as BorderControl, __experimentalBoxControl as BoxControl,
    __experimentalGrid as Grid,
    __experimentalUnitControl as UnitControl, BaseControl,
    PanelBody,
    SelectControl,
    TabPanel, TextControl,
    ToggleControl
} from "@wordpress/components";
import {useSetting} from '@wordpress/block-editor';
import {DIMENSION_UNITS, DIMENSION_UNITS_TEXT} from "Includes/config";
import {useUniqueId} from "Includes/helper";


function blockClassNames(attributes = {}) {

    const {'wpbs-contact-form': settings = {}} = attributes;

    return [
        'wpbs-contact-form wpbs-has-container flex flex-wrap',
        attributes?.uniqueId ?? null
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-contact-form': {
            type: 'object',
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-contact-form': settings = {}} = attributes;
        const menus = useSelect((select) => {
            const core = select('core');

            // Always call the selector to trigger resolution
            const data = core.getMenus?.();

            if (!core.hasFinishedResolution('getMenus')) {
                return []; // Use undefined instead of null
            }

            return data?.map(menu => ({
                id: menu.id,
                name: menu.name,
                slug: menu.slug,
                locations: menu.locations,
            }));
        }, []);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue,
            }

            setAttributes({'wpbs-contact-form': result});

        }, [settings, setAttributes]);

        const blockProps = useBlockProps({
            className: blockClassNames(attributes),
        });


        return <>


            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   selector={'wpbs-contact-form'} deps={['wpbs-contact-form']}/>

            <div {...blockProps}>FORM</div>
        </>

    },
    save: () => {
        return null;
    }
})


