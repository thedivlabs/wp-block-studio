import React, {useState} from "react"
import {TabPanel} from '@wordpress/components'
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";

export function Layout({settings = {}, update, clientId}) {

    const [display, setDisplay] = useState(settings.display || null);
    const [align, setAlign] = useState(settings.align || null);
    const [justify, setJustify] = useState(settings.justify || null);
    const [space, setSpace] = useState(settings.space || null);
    const [position, setPosition] = useState(settings.position || null);
    const [zIndex, setZIndex] = useState(settings.zIndex || null);
    const [overflow, setOverflow] = useState(settings.overflow || null);
    const [wrap, setWrap] = useState(settings.wrap || null);
    const [displayMobile, setDisplayMobile] = useState(settings.displayMobile || null);
    const [alignMobile, setAlignMobile] = useState(settings.alignMobile || null);
    const [justifyMobile, setJustifyMobile] = useState(settings.justifyMobile || null);
    const [spaceMobile, setSpaceMobile] = useState(settings.spaceMobile || null);
    const [positionMobile, setPositionMobile] = useState(settings.positionMobile || null);
    const [zIndexMobile, setZIndexMobile] = useState(settings.zIndexMobile || null);
    const [overflowMobile, setOverflowMobile] = useState(settings.overflowMobile || null);
    const [wrapMobile, setWrapMobile] = useState(settings.wrapMobile || null);

    function updateSettings(attr, val) {
        update({
            display: display,
            align: align,
            justify: justify,
            space: space,
            position: position,
            zIndex: zIndex,
            overflow: overflow,
            wrap: wrap,
            displayMobile: displayMobile,
            alignMobile: alignMobile,
            justifyMobile: justifyMobile,
            spaceMobile: spaceMobile,
            positionMobile: positionMobile,
            zIndexMobile: zIndexMobile,
            overflowMobile: overflowMobile,
            wrapMobile: wrapMobile,
        });
    }

    function Panels(tab) {
        return <>
            <SelectControl
                label={'Display'}
                value={tab.name === 'mobile' ? settings.displayMobile : settings.display}
                options={[
                    {label: 'Default', value: null},
                    {label: 'Row', value: 'row'},
                    {label: 'Row Reverse', value: 'row-reverse'},
                    {label: 'Column', value: 'column'},
                    {label: 'Column Reverse', value: 'column-reverse'},
                    {label: 'Block', value: 'block'},
                    {label: 'None', value: 'none'},
                ]}
                onChange={(value) => {
                    if (tab.name === 'mobile') {
                        setDisplayMobile(value);
                        updateSettings('displayMobile', value);
                    } else {
                        setDisplay(value);
                        updateSettings('display', value);
                    }

                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Align'}
                value={tab.name === 'mobile' ? settings.alignMobile : settings.align}
                options={[
                    {label: 'Default', value: null},
                    {label: 'Start', value: 'start'},
                    {label: 'Center', value: 'center'},
                    {label: 'End', value: 'end'},
                    {label: 'Stretch', value: 'stretch'},
                ]}
                onChange={(value) => {
                    if (tab.name === 'mobile') {
                        setAlignMobile(value);
                        updateSettings('alignMobile', value);
                    } else {
                        setAlign(value);
                        updateSettings('align', value);
                    }
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Justify'}
                value={tab.name === 'mobile' ? settings.justifyMobile : settings.justify}
                options={[
                    {label: 'Default', value: null},
                    {label: 'Start', value: 'start'},
                    {label: 'Center', value: 'center'},
                    {label: 'End', value: 'end'},
                    {label: 'Between', value: 'between'},
                    {label: 'Around', value: 'around'},
                ]}
                onChange={(value) => {
                    if (tab.name === 'mobile') {
                        setJustifyMobile(value);
                        updateSettings('justifyMobile', value);
                    } else {
                        setJustify(value);
                        updateSettings('justify', value);
                    }

                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Space'}
                value={tab.name === 'mobile' ? settings.spaceMobile : settings.space}
                options={[
                    {label: 'Default', value: null},
                    {label: 'Grow', value: 'grow'},
                    {label: 'Shrink', value: 'shrink'},
                    {label: 'No Grow', value: 'no-grow'},
                    {label: 'No Shrink', value: 'no-shrink'},
                ]}
                onChange={(value) => {
                    if (tab.name === 'mobile') {
                        setSpaceMobile(value);
                        updateSettings('spaceMobile', value);
                    } else {
                        setSpace(value);
                        updateSettings('space', value);
                    }

                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Position'}
                value={tab.name === 'mobile' ? settings.positionMobile : settings.position}
                options={[
                    {label: 'Default', value: null},
                    {label: 'Relative', value: 'relative'},
                    {label: 'Absolute', value: 'absolute'},
                ]}
                onChange={(value) => {
                    if (tab.name === 'mobile') {
                        setPositionMobile(value);
                        updateSettings('positionMobile', value);
                    } else {
                        setPosition(value);
                        updateSettings('position', value);
                    }

                }}
                __nextHasNoMarginBottom
            />
            <NumberControl
                label="Z-Index"
                value={tab.name === 'mobile' ? settings.zIndexMobile : settings.zIndex}
                onChange={(value) => {
                    if (tab.name === 'mobile') {
                        setZIndexMobile(value);
                        updateSettings('zIndexMobile', value);
                    } else {
                        setZIndex(value);
                        updateSettings('zIndex', value);
                    }
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Overflow'}
                value={tab.name === 'mobile' ? settings.overflowMobile : settings.overflow}
                options={[
                    {label: 'Default', value: null},
                    {label: 'Hidden', value: 'hidden'},
                    {label: 'Visible', value: 'visible'},
                ]}
                onChange={(value) => {
                    if (tab.name === 'mobile') {
                        setOverflowMobile(value);
                        updateSettings('overflowMobile', value);
                    } else {
                        setOverflow(value);
                        updateSettings('overflow', value);
                    }

                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Wrap'}
                value={tab.name === 'mobile' ? settings.wrapMobile : settings.wrap}
                options={[
                    {label: 'Default', value: null},
                    {label: 'Wrap', value: 'wrap'},
                    {label: 'No Wrap', value: 'no-wrap'},
                ]}
                onChange={(value) => {
                    if (tab.name === 'mobile') {
                        setWrapMobile(value);
                        updateSettings('wrapMobile', value);
                    } else {
                        setWrap(value);
                        updateSettings('wrap', value);
                    }

                }}
                __nextHasNoMarginBottom
            />


        </>;
    }


    return (
        <PanelBody title={'Layout'} initialOpen={false}>
            <TabPanel
                className="wpbs-tab-panel"
                activeClass="active-tab"
                orientation="horizontal"
                initialTabName="desktop"
                tabs={[
                    {
                        name: 'desktop',
                        title: 'Desktop',
                        className: 'desktop'
                    },
                    {
                        name: 'mobile',
                        title: 'Mobile',
                        className: 'mobile'
                    },
                ]}>
                {
                    (tab) => {
                        return <>
                            <Grid columns={1} columnGap={30} rowGap={20}>
                                <Grid columns={2} columnGap={20} rowGap={20}>
                                    {Panels(tab)}
                                </Grid>
                            </Grid>
                        </>
                    }
                }
            </TabPanel>
        </PanelBody>

    )
}
