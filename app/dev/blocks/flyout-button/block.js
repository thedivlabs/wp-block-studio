import './scss/block.scss';

import {
    useBlockProps,
    InspectorControls, PanelColorSettings, MediaUploadCheck, MediaUpload
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"

import {Style, STYLE_ATTRIBUTES} from "Components/Style";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"
import {
    __experimentalGrid as Grid, PanelBody,
    __experimentalUnitControl as UnitControl,
    TextControl, BaseControl
} from "@wordpress/components";
import React, {useCallback} from "react";
import {useUniqueId} from "Includes/helper";
import {DIMENSION_UNITS_TEXT} from "Includes/config";
import PreviewThumbnail from "Components/PreviewThumbnail";

function classNames(attributes = {}) {

    const {'wpbs-flyout-button': settings = {}} = attributes;

    return [
        'wpbs-flyout-button wpbs-flyout-toggle',
        'relative flex flex-col gap-2 items-center justify-center h-fit w-fit text-center cursor-pointer leading-none',
        !!settings?.image ? '--image' : null,
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-flyout-button': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-flyout-button': settings = {}} = attributes;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-flyout-button'],
                ...newValue
            };

            setAttributes({
                'wpbs-flyout-button': result
            });

        }, [setAttributes, settings])

        const blockProps = useBlockProps({
            className: classNames(attributes),
        });

        const cssProps = {
            '--color-label': settings?.['color-label'] ?? null,
            '--label-size': settings?.['label-size'] ?? null,
        };

        const imageProps = {
            className: 'wpbs-flyout-button__image',
            src: settings?.image?.url,
            alt: settings?.image?.alt
        }

        return <>

            <InspectorControls group={'styles'}>
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <BaseControl label={'Image'} __nextHasNoMarginBottom={true}>
                            <MediaUploadCheck>
                                <MediaUpload
                                    title={'Image'}
                                    onSelect={(newValue) => updateSettings({
                                        'image': {
                                            type: newValue.type,
                                            id: newValue.id,
                                            url: newValue.url,
                                            alt: newValue.alt,
                                            sizes: newValue.sizes,
                                        }
                                    })}
                                    allowedTypes={['image']}
                                    value={settings?.image}
                                    render={({open}) => {
                                        return <PreviewThumbnail
                                            image={settings?.image}
                                            callback={() => updateSettings({image: undefined})}
                                            onClick={open}
                                            contain={true}
                                        />;
                                    }}
                                />
                            </MediaUploadCheck>
                        </BaseControl>
                        <TextControl
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                            label="Icon"
                            value={settings?.icon ?? ''}
                            onChange={(newValue) => updateSettings({icon: newValue})}
                        />
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label="Label"
                                value={settings?.label ?? ''}
                                onChange={(newValue) => updateSettings({label: newValue})}
                            />
                            <UnitControl
                                label="Label Size"
                                value={settings?.['label-size'] ?? ''}
                                units={DIMENSION_UNITS_TEXT}
                                isResetValueOnUnitChange={true}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                onChange={(newValue) => updateSettings({'label-size': newValue})}
                            />
                        </Grid>
                        <PanelColorSettings
                            enableAlpha
                            className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                            colorSettings={[
                                {
                                    slug: 'color-label',
                                    label: 'Label',
                                    value: settings?.['color-label'],
                                    onChange: (newValue) => updateSettings({'color-label': newValue}),
                                    isShownByDefault: true
                                }
                            ]}
                        />

                    </Grid>
                </PanelBody>
            </InspectorControls>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   props={cssProps} selector={'wpbs-flyout-button'}
                   deps={['wpbs-flyout-button']}
            />

            <div {...blockProps} >
                {!!settings?.image ? <img {...imageProps} /> :
                    <span className={'wpbs-flyout-button__icon'} dangerouslySetInnerHTML={{__html: settings?.icon}}/>}
                {!!settings?.label ? <span className={'wpbs-flyout-button__label'}>{settings?.label}</span> : null}
            </div>

        </>;
    },
    save: (props) => {

        const {'wpbs-flyout-button': settings = {}} = props.attributes;

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/flyout',
            'data-wp-on--click': 'actions.toggle',
        });

        const imageProps = {
            className: 'wpbs-flyout-button__image',
            src: settings?.image?.url,
            alt: settings?.image?.alt
        }

        return <button {...blockProps} type={'button'}>
            {!!settings?.image ? <img {...imageProps} /> :
                <span className={'wpbs-flyout-button__icon'} dangerouslySetInnerHTML={{__html: settings?.icon}}/>}
            {!!settings?.label ? <span className={'wpbs-flyout-button__label'}>{settings?.label}</span> : null}
        </button>;
    }
})


