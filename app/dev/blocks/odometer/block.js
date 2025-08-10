import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"

import {Style, STYLE_ATTRIBUTES} from "Components/Style"

import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {cleanObject, useUniqueId} from "Includes/helper"
import {
    __experimentalNumberControl as NumberControl,
    __experimentalGrid as Grid, PanelBody, TextControl, ToggleControl,
} from "@wordpress/components";

function blockClassnames(attributes = {}) {


    return [
        'wpbs-odometer',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-odometer': {
            type: 'object',
            default: {
                start: 0,
                end: 100
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-odometer': settings} = attributes;

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue
            }

            setAttributes({'wpbs-odometer': result});

        }, [settings, setAttributes, clientId]);

        const blockProps = useBlockProps({className: blockClassnames(attributes)});

        return (
            <>
                <InspectorControls group={'styles'}>
                    <PanelBody>
                        <Grid columns={1} columnGap={15} rowGap={20}>
                            <Grid columns={2} columnGap={15} rowGap={20}>
                                <NumberControl
                                    label={'Start'}
                                    value={settings?.start}
                                    min={0}
                                    isDragEnabled={false}
                                    onChange={(newValue) => updateSettings({start: newValue})}
                                    __next40pxDefaultSize
                                />
                                <NumberControl
                                    label={'End'}
                                    value={settings?.end}
                                    min={0}
                                    isDragEnabled={false}
                                    onChange={(newValue) => updateSettings({end: newValue})}
                                    __next40pxDefaultSize
                                />

                                <NumberControl
                                    label={'Duration'}
                                    value={settings?.duration}
                                    min={100}
                                    step={50}
                                    isDragEnabled={false}
                                    onChange={(newValue) => updateSettings({duration: newValue})}
                                    __next40pxDefaultSize
                                />
                                <ToggleControl
                                    label={'Format'}
                                    checked={!!settings?.format}
                                    onChange={(newValue) => updateSettings({format: newValue})}
                                    __nextHasNoMarginBottom
                                />

                            </Grid>
                        </Grid>
                    </PanelBody>

                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       clientId={clientId}
                       selector={'wpbs-odometer'}
                />
                <div {...blockProps} >{attributes?.['wpbs-odometer']?.end}</div>
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes),
            'data-wp-interactive': 'wpbs/odometer',
            'data-wp-init': 'actions.init',
            'data-wp-context': JSON.stringify(props.attributes?.['wpbs-odometer']),
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        return <div {...blockProps} >{props.attributes?.['wpbs-odometer']?.start}</div>;
    }
})


