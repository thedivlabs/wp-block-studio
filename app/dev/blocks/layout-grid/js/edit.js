import "../scss/block.scss";

import {
    InspectorControls,
    PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType,} from "@wordpress/blocks"
import metadata from "../block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {BACKGROUND_ATTRIBUTES, BackgroundControls, BackgroundElement} from "Components/Background"
import {MEDIA_GALLERY_ATTRIBUTES, MediaGalleryControls} from "Components/MediaGallery"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import Loop from "Components/Loop"
import {
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid,
    __experimentalInputControl as InputControl,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl,
    BaseControl,
    PanelBody,
    TabPanel,
    ToggleControl
} from "@wordpress/components";
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import Breakpoint from 'Components/Breakpoint';

function classNames(attributes = {}) {
    return [
        'wpbs-layout-grid',
        !!attributes?.['wpbs-masonry'] ? 'wpbs-layout-grid--masonry masonry !block' : null,
        'w-full flex relative',
        !!attributes['wpbs-query']?.pagination ? 'wpbs-layout-grid--pagination' : null,
        'wpbs-container',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...BACKGROUND_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...MEDIA_GALLERY_ATTRIBUTES,
        'wpbs-grid': {
            type: 'object',
            default: {
                'columns-mobile': undefined,
                'columns-small': undefined,
                'columns-large': undefined,
                'breakpoint-small': undefined,
                'masonry': undefined,
                'gallery': {},
                'divider': {},
                'divider-icon': undefined,
                'divider-icon-size': undefined,
                'divider-icon-color': undefined,
                'pagination': undefined,
                'pagination-size': undefined,
                'pagination-label': undefined,
            }
        }
    },
    edit: (props) => {

        const {attributes, setAttributes, clientId} = props;
        const [grid, setGrid] = useState(attributes['wpbs-grid'] || {});
        const breakpoints = WPBS?.settings?.breakpoints ?? {};

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...grid,
                ...newValue
            };

            setAttributes({
                'wpbs-grid': result
            });
            setGrid(result);

        }, [setAttributes, setGrid])

        const blockProps = useBlockProps({
            className: [classNames(attributes), 'empty:min-h-8'].join(' ')
        });

        const cssProps = useMemo(() => {
            const grid = attributes['wpbs-grid'] ?? {};
            const layout = attributes['wpbs-layout'] ?? {};
            const spacing = attributes?.style?.spacing?.blockGap ?? {};

            return {
                '--grid-row-gap': spacing.top,
                '--grid-col-gap': spacing.left,
                '--columns': grid['columns-mobile'],
                '--divider-width': grid.divider?.width,
                '--divider-color': grid.divider?.color,
                '--divider-icon': grid?.['divider-icon'],
                '--divider-icon-size': grid?.['divider-icon-size'],
                '--divider-icon-color': grid?.['divider-icon-color'],
                breakpoints: {
                    [[grid?.['breakpoint-small'] ?? 'sm']]: {
                        '--columns': grid['columns-small']
                    },
                    [[grid?.['breakpoint-large'] ?? layout.breakpoint ?? 'normal']]: {
                        '--columns': grid['columns-large'],
                        '--grid-row-gap': layout?.['gap-mobile']?.top,
                        '--grid-col-gap': layout?.['gap-mobile']?.left,
                    }
                }
            };
        }, [attributes['wpbs-grid']]);

        const tabOptions = useMemo(() => {
            return <Grid columns={1} columnGap={15} rowGap={20}>
                <BaseControl label={'Grid Columns'} __nextHasNoMarginBottom={true}>
                    <Grid columns={3} columnGap={15} rowGap={20}>
                        <NumberControl
                            label={'Mobile'}
                            __next40pxDefaultSize
                            isShiftStepEnabled={false}
                            onChange={(newValue) => {
                                updateSettings({'columns-mobile': newValue});
                            }}
                            value={grid['columns-mobile']}
                        />
                        <NumberControl
                            label={'Small'}
                            __next40pxDefaultSize
                            isShiftStepEnabled={false}
                            onChange={(newValue) => {
                                updateSettings({'columns-small': newValue});
                            }}
                            value={grid['columns-small']}
                        />
                        <NumberControl
                            label={'Large'}
                            __next40pxDefaultSize
                            isShiftStepEnabled={false}
                            onChange={(newValue) => {
                                updateSettings({'columns-large': newValue});
                            }}
                            value={grid['columns-large']}
                        />
                    </Grid>
                </BaseControl>
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
                    <Breakpoint
                        label={'Breakpoint SM'}
                        defaultValue={attributes['wpbs-grid']['breakpoint-small']}
                        callback={(newValue) => {
                            updateSettings({'breakpoint-small': newValue});
                        }}/>
                    <Breakpoint
                        label={'Breakpoint LG'}
                        defaultValue={attributes['wpbs-grid']['breakpoint-large']}
                        callback={(newValue) => {
                            updateSettings({'breakpoint-large': newValue});
                        }}/>
                </Grid>
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label="Masonry"
                        checked={!!grid['masonry']}
                        onChange={(newValue) => {
                            updateSettings({'masonry': newValue});
                        }}
                    />
                </Grid>
                <BorderControl
                    __next40pxDefaultSize
                    enableAlpha
                    enableStyle
                    disableUnits
                    value={grid['divider'] || {}}
                    colors={WPBS?.settings?.colors ?? []}
                    __experimentalIsRenderedInSidebar={true}
                    label="Divider"
                    onChange={(newValue) => {
                        updateSettings({'divider': newValue})
                    }}
                    shouldSanitizeBorder
                />
                <Grid columns={2} columnGap={15} rowGap={20}>

                    <InputControl
                        label={'Divider Icon'}
                        __next40pxDefaultSize
                        value={grid['divider-icon']}
                        onChange={(newValue) => {
                            updateSettings({'divider-icon': newValue})
                        }}
                    />
                    <UnitControl
                        label={'Icon Size'}
                        value={grid['divider-icon-size']}
                        isResetValueOnUnitChange={true}
                        onChange={(newValue) => {
                            updateSettings({'divider-icon-size': newValue})
                        }}
                        units={[
                            {value: 'px', label: 'px', default: 0},
                            {value: 'em', label: 'em', default: 0},
                            {value: 'rem', label: 'rem', default: 0},
                            {value: 'vw', label: 'vw', default: 0},
                        ]}
                        __next40pxDefaultSize
                    />
                </Grid>
                <PanelColorSettings
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0'}
                    colorSettings={[
                        {
                            slug: 'icon-color',
                            label: 'Divider Icon Color',
                            value: grid['divider-icon-color'],
                            onChange: (newValue) => {
                                updateSettings({'divider-icon-color': newValue})
                            },
                            isShownByDefault: true
                        }
                    ]}
                />
            </Grid>
        }, [grid]);

        const tabLoop = useMemo(() => {
            return <Loop attributes={attributes} setAttributes={setAttributes}/>
        }, [grid])

        const tabGallery = useMemo(() => {
            return <MediaGalleryControls attributes={attributes} setAttributes={setAttributes} cardClass={'layout-grid-card'}/>
        }, [attributes['wpbs-grid']])

        const tabs = {
            options: tabOptions,
            loop: tabLoop,
            gallery: tabGallery,
        }

        const innerBlockProps = useInnerBlocksProps({
            className: 'wpbs-layout-grid__container relative z-20',
        }, {
            allowedBlocks: [
                "wpbs/media-gallery-card",
                "wpbs/layout-grid-card",
                "core/query-pagination"
            ]
        });

        return (
            <>
                <InspectorControls group="styles">

                    <PanelBody>

                        <TabPanel
                            className="wpbs-editor-tabs"
                            activeClass="active"
                            orientation="horizontal"
                            initialTabName="options"
                            tabs={[
                                {
                                    name: 'options',
                                    title: 'Options',
                                    className: 'tab-options',
                                },
                                {
                                    name: 'loop',
                                    title: 'Loop',
                                    className: 'tab-loop'
                                },
                                {
                                    name: 'gallery',
                                    title: 'Gallery',
                                    className: 'tab-gallery',
                                },
                            ]}>
                            {
                                (tab) => (<>{tabs[tab.name]}</>)
                            }
                        </TabPanel>

                    </PanelBody>


                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes}
                       deps={['wpbs-grid']}
                       props={cssProps}
                />

                <div {...blockProps}>

                    <div {...innerBlockProps} />
                    <BackgroundElement attributes={props.attributes} editor={true}/>
                </div>
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: classNames(props.attributes),
            'data-wp-interactive': 'wpbs/grid',
            'data-wp-init': 'actions.init',
            'data-wp-context': JSON.stringify({
                uniqueId: props.attributes.uniqueId,
                divider: !!Object.keys(props.attributes['wpbs-grid']?.['divider'] ?? {}).length,
                breakpoints: {
                    small: props.attributes?.['wpbs-grid']?.['breakpoint-small'],
                    large: props.attributes?.['wpbs-grid']?.['breakpoint-large'] ?? props.attributes?.['wpbs-layout']?.['breakpoint'] ?? 'lg',
                },
                columns: {
                    mobile: props.attributes['wpbs-grid']?.['columns-mobile'] ?? 1,
                    small: props.attributes['wpbs-grid']?.['columns-small'] ?? 2,
                    large: props.attributes['wpbs-grid']?.['columns-large'] ?? 3,
                }
            })
        });

        const innerBlockProps = useInnerBlocksProps.save({
            className: 'wpbs-layout-grid__container relative z-20',
        }, {});

        const GutterSizer = () => {
            if (!!props.attributes['wpbs-masonry']) {
                return <span className={"gutter-sizer"}
                             style={{width: 'var(--row-gap, var(--column-gap, 0px))'}}></span>;
            } else {
                return <></>;
            }
        }

        const PaginationButton = () => {
            if ((props.attributes?.className ?? '').includes('is-style-loop') && !!props.attributes['wpbs-query']?.pagination && props.attributes?.['wpbs-query']?.['post_type'] !== 'current') {
                return <button type="button"
                               className={"wpbs-layout-grid__button h-10 px-4 relative z-20 hidden"}
                               data-wp-on-async--click="actions.pagination">
                    {props.attributes['wpbs-grid']?.['pagination-label'] || 'Show More'}
                </button>;
            } else {
                return <></>;
            }
        }

        return (
            <div {...blockProps}>
                <div {...innerBlockProps} >
                    {innerBlockProps.children}
                    <GutterSizer/>

                </div>
                <PaginationButton/>
                <BackgroundElement attributes={props.attributes} editor={false}/>
                {(props.attributes?.className ?? '').includes('is-style-loop') &&
                    <script class="wpbs-layout-grid-args" type="application/json"/>}
            </div>
        );
    }
})


