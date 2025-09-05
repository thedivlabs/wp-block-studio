import {
    useBlockProps,
    BlockEdit, PanelColorSettings, InspectorControls,
} from "@wordpress/block-editor"

import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {useInstanceId} from "@wordpress/compose";
import {
    __experimentalGrid as Grid,
    PanelBody,
} from "@wordpress/components";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Style, STYLE_ATTRIBUTES} from "Components/Style.js";
import {LayoutControls, LAYOUT_ATTRIBUTES} from "Components/Layout"
import {useUniqueId} from "Includes/helper";
import {IconControl, MaterialIcon} from "Components/IconControl";
import {useSetting} from '@wordpress/block-editor';

function blockClasses(attributes = {}) {

    return [
        'wpbs-slider-nav',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

function blockStyles(attributes = {}) {
    return Object.fromEntries(
        Object.entries({
            '--swiper-pagination-color': attributes['wpbs-slider-navigation']?.['pagination-color'] || null,
            '--swiper-pagination-bullet-inactive-color': attributes['wpbs-slider-navigation']?.['pagination-track-color'] || null,
        }).filter(([key, value]) => value)
    );
}

function BlockContent({props, options = {}}) {

    const buttonClass = 'wpbs-slider-nav__btn';

    const {slider = {}} = options;

    const prevClass = [
        buttonClass,
        'wpbs-slider-nav__btn--prev wpbs-slider-btn--prev',
    ].filter(x => x).join(' ');

    const nextClass = [
        buttonClass,
        'wpbs-slider-nav__btn--next wpbs-slider-btn--next',
    ].filter(x => x).join(' ');

    const paginationClass = 'wpbs-slider-nav__pagination swiper-pagination';

    return <div {...props}>
        <button type="button" className={prevClass}>
            <MaterialIcon className={'wpbs-slider-nav__icon'}
                          name={options?.['icon-prev'] ?? 'chevron_left'}
                          size={24}
                          style={0}
                          {...(slider?.['icon-prev'] ?? {})}

            />
            <span className="screen-reader-text">Previous Slide</span>
        </button>
        {!!slider?.pagination ? <div className={paginationClass}></div> : null}
        <button type="button" className={nextClass}>
            <MaterialIcon className={'wpbs-slider-nav__icon'}
                          name={options?.['icon-next'] ?? 'chevron_right'}
                          size={24}
                          style={0}
                          {...(slider?.['icon-next'] ?? {})}

            />
            <span className="screen-reader-text">Next Slide</span>
        </button>
    </div>;
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-slider-navigation': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-slider-navigation': settings = {}} = attributes;

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
            style: blockStyles(attributes)
        });

        const slider = useMemo(() => {
            return context?.['wpbs/settings']?.slider ?? context?.['wpbs/settings'] ?? {};
        }, [context?.['wpbs/settings']?.slider ?? context?.['wpbs/settings'] ?? {}]);

        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue,
                slider: slider
            }

            setAttributes({'wpbs-slider-navigation': result});

        }, [setAttributes, settings, slider]);

        const customSettings = useSetting('custom')?.slider ?? {};

        useEffect(() => {

            const next = customSettings?.button?.next ?? 'chevron_right'
            const prev = customSettings?.button?.prev ?? 'chevron_left'

            if (next !== settings?.['icon-next'] || prev !== settings?.['icon-prev']) {
                updateSettings({
                    'icon-next': next,
                    'icon-prev': prev,
                });
            }

        }, [customSettings]);

        return <>
            <BlockEdit key="edit" {...blockProps} />

            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={0}>
                        <PanelColorSettings
                            enableAlpha
                            className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                            colorSettings={[
                                {
                                    slug: 'pagination-color',
                                    label: 'Pagination',
                                    value: settings?.['pagination-color'] ?? '',
                                    onChange: (newValue) => updateSettings({'pagination-color': newValue}),
                                    isShownByDefault: true
                                },
                                {
                                    slug: 'pagination-track-color',
                                    label: 'Pagination Track',
                                    value: settings?.['pagination-track-color'] ?? '',
                                    onChange: (newValue) => updateSettings({'pagination-track-color': newValue}),
                                    isShownByDefault: true
                                }
                            ]}
                        />

                    </Grid>
                </PanelBody>
            </InspectorControls>

            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   uniqueId={uniqueId} selector={'wpbs-slider-navigation'}
                   deps={['wpbs-slider-navigation']}
            />

            <BlockContent props={blockProps} options={attributes?.['wpbs-slider-navigation'] ?? {}}/>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            style: blockStyles(props.attributes),
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        return (
            <BlockContent props={blockProps} options={props.attributes?.['wpbs-slider-navigation'] ?? {}}/>
        );
    }
})


