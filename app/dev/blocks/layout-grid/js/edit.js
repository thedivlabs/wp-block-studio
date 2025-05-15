import "../scss/block.scss";

import {
    InspectorControls,
    PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType,} from "@wordpress/blocks"
import metadata from "../block.json"
import {layoutAttributes, LayoutControls} from "Components/Layout"
import {backgroundAttributes, BackgroundControls, BackgroundElement, backgroundStyles} from "Components/Background"
import {Style} from "Components/Style"
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
import React, {useEffect, useState} from "react";
import Breakpoint from 'Components/Breakpoint';

function sectionClassNames(attributes = {}) {
    return [
        'wpbs-layout-grid',
        !!attributes['wpbs-masonry'] ? 'wpbs-layout-grid--masonry masonry !block' : null,
        'w-full flex relative',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

function sectionProps(attributes = {}) {

    const {width, color} = attributes['wpbs-grid']?.divider ?? {};

    return Object.fromEntries(
        Object.entries({
            '--divider-width': width,
            '--divider-color': color,
            '--divider-icon': attributes['wpbs-grid']?.['wpbs-divider-icon'] ?? null,
            '--divider-icon-size': attributes['wpbs-grid']?.['wpbs-divider-icon-size'] ?? null,
            '--divider-icon-color': attributes['wpbs-grid']?.['wpbs-divider-icon-color'] ?? null,
        }).filter(([key, value]) => ![null, undefined].includes(value))
    );
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...layoutAttributes,
        ...backgroundAttributes,
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
        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid');
        const [grid, setGrid] = useState(attributes['wpbs-grid'] || {});

        useEffect(() => {
            setAttributes({
                'uniqueId': uniqueId
            });
        }, []);

        function updateGridSettings(newValue) {

            const result = {
                ...grid,
                ...newValue
            };

            setAttributes({
                'wpbs-grid': result,
                'wpbs-props': {
                    ...attributes.props,
                    'columns-mobile': result?.['columns-mobile'] ?? undefined,
                    'columns-small': result?.['columns-small'] ?? undefined,
                    'columns-large': result?.['columns-large'] ?? undefined,
                }
            });
            setGrid(result);

        }

        const tabOptions = <Grid columns={1} columnGap={15} rowGap={20}>
            <BaseControl label={'Grid Columns'} __nextHasNoMarginBottom={true}>
                <Grid columns={3} columnGap={15} rowGap={20}>
                    <NumberControl
                        label={'Mobile'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            updateGridSettings({'columns-mobile': newValue});
                        }}
                        value={grid['columns-mobile']}
                    />
                    <NumberControl
                        label={'Small'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            updateGridSettings({'columns-small': newValue});
                        }}
                        value={grid['columns-small']}
                    />
                    <NumberControl
                        label={'Large'}
                        __next40pxDefaultSize
                        isShiftStepEnabled={false}
                        onChange={(newValue) => {
                            updateGridSettings({'columns-large': newValue});
                        }}
                        value={grid['columns-large']}
                    />
                </Grid>
            </BaseControl>
            <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
                <Breakpoint defaultValue={attributes['wpbs-grid']['breakpoint-small']}
                            callback={(newValue) => {
                                updateGridSettings({'breakpoint-small': newValue});
                            }}/>
                <Breakpoint defaultValue={attributes['wpbs-grid']['breakpoint-large']}
                            callback={(newValue) => {
                                updateGridSettings({'breakpoint-large': newValue});
                            }}/>
            </Grid>
            <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Masonry"
                    checked={!!grid['masonry']}
                    onChange={(newValue) => {
                        updateGridSettings({'masonry': newValue});
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
                    updateGridSettings({'divider': newValue})
                }}
                shouldSanitizeBorder
            />
            <Grid columns={2} columnGap={15} rowGap={20}>

                <InputControl
                    label={'Divider Icon'}
                    __next40pxDefaultSize
                    value={grid['divider-icon']}
                    onChange={(newValue) => {
                        updateGridSettings({'divider-icon': newValue})
                    }}
                />
                <UnitControl
                    label={'Icon Size'}
                    value={grid['divider-icon-size']}
                    isResetValueOnUnitChange={true}
                    onChange={(newValue) => {
                        updateGridSettings({'divider-icon-size': newValue})
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
                            updateGridSettings({'divider-icon-color': newValue})
                        },
                        isShownByDefault: true
                    }
                ]}
            />
        </Grid>;
        const tabLoop = <Loop attributes={attributes} setAttributes={setAttributes}/>

        const tabs = {
            options: tabOptions,
            loop: tabLoop
        }

        const blockProps = useBlockProps({
            className: [sectionClassNames(attributes), 'empty:min-h-8'].join(' '),
            style: {
                ...props.style,
                ...sectionProps(attributes)
            }
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
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId} customCss={backgroundStyles(attributes)}/>

                <div {...blockProps}>

                    <div {...useInnerBlocksProps({
                        className: 'wpbs-layout-grid__container relative z-20',
                    }, {})} />
                    <BackgroundElement attributes={props.attributes} editor={false}/>
                </div>
            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
            'data-wp-interactive': 'wpbs/grid',
            'data-wp-init': 'actions.init',
            'data-wp-context': JSON.stringify({
                uniqueId: props.attributes.uniqueId,
                divider: !!props.attributes['wpbs-grid']?.['divider'].length,
                breakpoints: props.attributes['wpbs-grid']?.['breakpoints'],
                columns: {
                    mobile: props.attributes['wpbs-props']?.['columns-mobile'] ?? 1,
                    small: props.attributes['wpbs-props']?.['columns-small'] ?? 2,
                    large: props.attributes['wpbs-props']?.['columns-large'] ?? 3,
                }
            }),
            style: {
                ...props.style,
                ...sectionProps(props.attributes)
            }
        });

        const innerBlockProps = useInnerBlocksProps.save({
            className: 'wpbs-layout-grid__container relative z-20',
        }, {});

        const GutterSizer = () => {
            if (!!props.attributes['wpbs-masonry']) {
                return <span class="gutter-sizer"
                             style="width:var(--row-gap, var(--column-gap, 0px))"></span>;
            } else {
                return <></>;
            }
        }

        const PaginationButton = () => {
            if (!!props.attributes['wpbs-grid']?.pagination && props.attributes?.['wpbs-query']?.['post_type'] !== 'current') {
                return <button type="button" class="w-full h-10 relative"
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
            </div>
        );
    }
})


