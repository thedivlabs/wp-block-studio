import "../scss/block.scss";

import {
    InspectorControls,
    PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType,} from "@wordpress/blocks"
import metadata from "../block.json"
import {layoutAttributes, LayoutControls, layoutCss} from "Components/Layout"
import {backgroundAttributes, BackgroundControls, BackgroundElement, backgroundCss} from "Components/Background"
import {Style, styleAttributes} from "Components/Style"
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
import {InnerBlocks} from "@wordpress/editor";

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
        ...styleAttributes,
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

        function updateGridSettings(newValue) {

            const result = {
                ...grid,
                ...newValue
            };

            setAttributes({
                'wpbs-grid': result
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
                <Breakpoint
                    label={'Breakpoint SM'}
                    defaultValue={attributes['wpbs-grid']['breakpoint-small']}
                    callback={(newValue) => {
                        updateGridSettings({'breakpoint-small': newValue});
                    }}/>
                <Breakpoint
                    label={'Breakpoint LG'}
                    defaultValue={attributes['wpbs-grid']['breakpoint-large']}
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
                <Style attributes={attributes} setAttributes={setAttributes}
                       uniqueId={uniqueId}
                       css={[backgroundCss(attributes), layoutCss(attributes)]}
                       deps={['wpbs-layout', 'wpbs-background']}
                       props={{
                           '--columns': attributes['wpbs-grid']?.['columns-mobile'] ?? undefined,
                           breakpoints:{
                               [breakpoints[attributes['wpbs-grid']?.['breakpoint-large'] ?? attributes['wpbs-layout']?.breakpoint ?? 'normal']]: {'--columns': attributes['wpbs-grid']?.['columns-small'] ?? undefined},
                               [breakpoints[attributes['wpbs-grid']?.['breakpoint-small'] ?? 'normal']]: {'--columns': attributes['wpbs-grid']?.['columns-large'] ?? undefined}
                           }
                       }}
                />

                <div {...blockProps}>

                    <InnerBlocks/>
                    <BackgroundElement attributes={props.attributes} editor={true}/>
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
                    mobile: props.attributes['wpbs-grid']?.['columns-mobile'] ?? 1,
                    small: props.attributes['wpbs-grid']?.['columns-small'] ?? 2,
                    large: props.attributes['wpbs-grid']?.['columns-large'] ?? 3,
                }
            }),
            style: {
                ...props.style,
                ...sectionProps(props.attributes)
            }
        });

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
                <InnerBlocks.Content/>
                <PaginationButton/>
                <BackgroundElement attributes={props.attributes} editor={false}/>
            </div>
        );
    }
})


