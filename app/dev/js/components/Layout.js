import React, {useState} from "react"
import {TabPanel} from '@wordpress/components'
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import {updateSettings} from '../inc/helper'

export function Layout({settings = {}, update, clientId}) {

    settings = Object.assign({}, {
        display: null,
        align: null,
        justify: null,
        space: null, // flex-grow
        position: null,
        overflow: null,
        wrap: null,

        displayMobile: null,
        alignMobile: null,
        justifyMobile: null,
        spaceMobile: null, // flex-grow
        positionMobile: null,
        overflowMobile: null,
        wrapMobile: null,
    }, settings);

    function updateSettings(attr, val) {
        update(Object.assign({}, settings, {[attr]: val}));
    }

    function Panels(tab) {
        return <>
            <SelectControl
                label={'Display'}
                value={tab.name === 'mobile' ? settings.displayMobile : settings.display}
                options={[
                    {label: 'Default', value: null},
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
            <SelectControl
                label={'Overflow'}
                value={tab.name === 'mobile' ? settings.overflowMobile : settings.overflow}
                options={[
                    {label: 'Default', value: null},
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
    }


    return (
        <PanelBody title={'Layout'}>
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
