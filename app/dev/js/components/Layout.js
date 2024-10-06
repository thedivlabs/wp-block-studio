import React, {useState} from "react"
import {TabPanel} from '@wordpress/components'
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";

export function Layout({settings = {}, update}) {

    settings = Object.assign({}, {
        display: null,
        align: null,
        justify: null,
        space: null, // flex-grow
        position: null,
        zIndex: null,
        overflow: null,
        wrap: null,
        displayMobile: null,
        alignMobile: null,
        justifyMobile: null,
        spaceMobile: null, // flex-grow
        positionMobile: null,
        zIndexMobile: null,
        overflowMobile: null,
        wrapMobile: null,
    }, settings);

    function updateSettings(attr, val) {
        settings[attr] = val;
        update(settings);
    }

    console.log(settings);

    /*function Panels(tab) {
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
                        updateSettings('displayMobile', value);
                    } else {
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
                        updateSettings('alignMobile', value);
                    } else {
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
                        updateSettings('justifyMobile', value);
                    } else {
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
                        updateSettings('spaceMobile', value);
                    } else {
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
                        updateSettings('positionMobile', value);
                    } else {
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
                        updateSettings('zIndexMobile', value);
                    } else {
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
                        updateSettings('overflowMobile', value);
                    } else {
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
                        updateSettings('wrapMobile', value);
                    } else {
                        updateSettings('wrap', value);
                    }

                }}
                __nextHasNoMarginBottom
            />


        </>;
    }*/

    function Panels() {
        return <>
            <SelectControl
                label={'Display'}
                value={settings.display}
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
                    updateSettings('display', value);

                }}
                __nextHasNoMarginBottom
            />
        </>;
    }
    function PanelsMobile() {
        return <>
            <SelectControl
                label={'Display'}
                value={settings.displayMobile}
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
                    updateSettings('displayMobile', value);
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
                        className: 'desktop',
                        content: Panels()
                    },
                    {
                        name: 'mobile',
                        title: 'Mobile',
                        className: 'mobile',
                        content: PanelsMobile()
                    },
                ]}>
            </TabPanel>
        </PanelBody>

    )
}
