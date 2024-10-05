import React, {useState} from "react"
import {TabPanel} from '@wordpress/components'
import {
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import {updateSettings} from '../inc/helper'

export function Layout({settings = {}, pushSettings, clientId}) {

    settings = Object.assign({}, {
        display: null,
        align: null,
        justify: null,
        height: null,
        width: null,
        maxWidth: null,
        space: null, // flex-grow
        position: null,
        overflow: null,
        wrap: null,

        displayMobile: null,
        alignMobile: null,
        justifyMobile: null,
        heightMobile: null,
        widthMobile: null,
        maxWidthMobile: null,
        spaceMobile: null, // flex-grow
        positionMobile: null,
        overflowMobile: null,
        wrapMobile: null,
    }, settings);

    const options = {
        display: [
            {label: 'Row', value: 'row'},
            {label: 'Row Reverse', value: 'row-reverse'},
            {label: 'Column', value: 'column'},
            {label: 'Column Reverse', value: 'column-reverse'},
            {label: 'None', value: 'none'},
        ],
        align: [],
        justify: [],
        height: [],
        width: [],
        maxWidth: [],
        space: [],
        position: [],
        overflow: [],
        wrap: [],
    }

    const [display, setDisplay] = useState(settings.display);
    const [align, setAlign] = useState(settings.align);
    const [justify, setJustify] = useState(settings.justify);
    const [height, setHeight] = useState(settings.height);
    const [width, setWidth] = useState(settings.width);
    const [maxWidth, setMaxWidth] = useState(settings.maxWidth);
    const [space, setSpace] = useState(settings.space);
    const [position, setPosition] = useState(settings.position);
    const [overflow, setOverflow] = useState(settings.overflow);
    const [wrap, setWrap] = useState(settings.wrap);

    const [displayMobile, setDisplayMobile] = useState(settings.displayMobile);
    const [alignMobile, setAlignMobile] = useState(settings.alignMobile);
    const [justifyMobile, setJustifyMobile] = useState(settings.justifyMobile);
    const [heightMobile, setHeightMobile] = useState(settings.heightMobile);
    const [widthMobile, setWidthMobile] = useState(settings.widthMobile);
    const [maxWidthMobile, setMaxWidthMobile] = useState(settings.maxWidthMobile);
    const [spaceMobile, setSpaceMobile] = useState(settings.spaceMobile);
    const [positionMobile, setPositionMobile] = useState(settings.positionMobile);
    const [overflowMobile, setOverflowMobile] = useState(settings.overflowMobile);
    const [wrapMobile, setWrapMobile] = useState(settings.wrapMobile);


    function updateSettings(attr, val, callback) {
        callback(val);
        if (pushSettings) {
            pushSettings(Object.assign({}, settings, {[attr]: val}));
        }
    }

    const panels = () => Object.entries(options).forEach((entry) => {
        const [key, value] = entry;

        const name = key.replace(/([a-z])([A-Z])/g, '$1 $2').split(" ");

        return <SelectControl
            label={name}
            value={key}
            options={options[key]}
            onChange={(value) => {
                updateSettings(key, value, this['set' + name]);
            }}
            __nextHasNoMarginBottom
        />

    });


    return (
        <PanelBody title={'Flex'}>
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
                                    {[...panels]}
                                </Grid>
                            </Grid>
                        </>
                    }
                }
            </TabPanel>
        </PanelBody>

    )
}
