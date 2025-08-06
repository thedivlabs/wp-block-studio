import './scss/block.scss'

import {
    InspectorControls, PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useMemo} from "react";
import {
    __experimentalUnitControl as UnitControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl, PanelBody, ToggleControl,
} from "@wordpress/components";
import {DIMENSION_UNITS} from "Includes/config";
import {useUniqueId} from "Includes/helper";

function blockClassnames(attributes = {}, editor = false) {

    const {'wpbs-flyout': settings = {}} = attributes;

    return [
        'wpbs-flyout',
        'flex flex-col w-full relative overflow-y-scroll',
        attributes?.uniqueId ?? null,
        attributes?.fade ? '--fade' : null,
        !!editor ? '--editor' : null,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        'wpbs-flyout': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        //const uniqueId = useInstanceId(registerBlockType, 'wpbs-flyout');

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-flyout': settings = {}} = attributes;

        const cssProps = useMemo(() => {
            return {
                '--container-width': settings?.['max-width'],
                '--blur': settings?.['blur'],
                '--grayscale': settings?.['grayscale'],
                '--animation': settings?.['animation'],
                '--overlay': settings?.['overlay'],
            };
        }, [settings]);

        const blockProps = useBlockProps({className: blockClassnames(attributes, true)});

        const innerBlocksProps = useInnerBlocksProps({
            className: 'wpbs-flyout__container'
        });

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue
            }

            setAttributes({'wpbs-flyout': result});

        }, [setAttributes, settings])


        return (
            <>

                <InspectorControls group="styles">

                    <PanelBody initialOpen={true}>

                        <Grid columnGap={20} columns={1} rowGap={20}>

                            <Grid columnGap={20} columns={2} rowGap={15}>

                                <UnitControl
                                    label="Max-Width"
                                    value={settings?.['max-width']}
                                    onChange={(newValue) => updateSettings({'max-width': newValue})}
                                    units={DIMENSION_UNITS}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />

                                <NumberControl
                                    label="Grayscale"
                                    step={.1}
                                    min={0}
                                    max={1}
                                    value={settings?.['grayscale']}
                                    onChange={(newValue) => updateSettings({'grayscale': newValue})}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <UnitControl
                                    label="Blur"
                                    value={settings?.['blur']}
                                    step={1}
                                    onChange={(newValue) => updateSettings({'blur': newValue})}
                                    units={[
                                        {value: 'px', label: 'px', default: 0}
                                    ]}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <UnitControl

                                    label="Animation"
                                    value={settings?.['animation']}
                                    step={50}
                                    min={100}
                                    onChange={(newValue) => updateSettings({'animation': newValue})}
                                    units={[
                                        {value: 'ms', label: 'ms', default: 100}
                                    ]}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />

                            </Grid>

                            <Grid columnGap={20} columns={2} rowGap={15} style={{marginTop: '15px'}}>
                                <ToggleControl

                                    label="Fade"
                                    checked={!!settings?.['fade']}
                                    onChange={(newValue) => updateSettings({'fade': newValue})}
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                            </Grid>

                            <PanelColorSettings
                                enableAlpha
                                className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                                colorSettings={[
                                    {
                                        slug: 'overlay',
                                        label: 'Overlay',
                                        value: settings?.['overlay'],
                                        onChange: (newValue) => updateSettings({'overlay': newValue}),
                                        isShownByDefault: true
                                    }
                                ]}
                            />
                        </Grid>

                    </PanelBody>

                </InspectorControls>

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-flyout']} selector={'wpbs-flyout'}
                       props={cssProps}
                />


                <nav {...blockProps}>
                    <div {...innerBlocksProps} />
                </nav>

            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes),
            'data-wp-interactive': 'wpbs/flyout',
            'data-wp-on--click': 'actions.toggle',
            'data-wp-class--active': 'state.active',
            'data-wp-state': 'active',
        });

        const innerBlocksProps = useInnerBlocksProps.save({
            className: 'wpbs-flyout__container'
        });

        return <nav {...blockProps}>
            <div {...innerBlocksProps} />
        </nav>;
    }
})


