import React, {useState} from "react"
import {
    TabPanel,
    __experimentalGrid as Grid,
    PanelBody,
    SelectControl,
    ToggleControl,
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";

export function LayoutProps(props) {
    
    if (
        !('layout' in props.attributes) ||
        !('desktop' in props.attributes.layout) ||
        !('mobile' in props.attributes.layout)
    ) {
        return {
            className: '',
            style: {}
        };
    }

    let style = {
        '--column-display': props.attributes.layout.desktop.display || null,
        '--column-align': props.attributes.layout.desktop.align || null,
        '--column-justify': props.attributes.layout.desktop.justify || null,
        '--column-height': props.attributes.layout.desktop.height || null,
        '--column-width': props.attributes.layout.desktop.width || null,
        '--column-maxWidth': props.attributes.layout.desktop.maxWidth || null,
        '--column-basis': props.attributes.layout.desktop.basis || null,
    };

    switch (props.attributes.layout.desktop.space) {
        case 'grow':
            style['--column-grow'] = '1';
            break;
        case 'no-grow':
            style['--column-grow'] = '0';
            break;
        case 'shrink':
            style['--column-shrink'] = '1';
            break;
        case 'no-shrink':
            style['--column-shrink'] = '0';
            break;
    }

    switch (props.attributes.layout.mobile.space) {
        case 'grow':
            style['--column-mobile-grow'] = '1';
            break;
        case 'no-grow':
            style['--column-mobile-grow'] = '0';
            break;
        case 'shrink':
            style['--column-mobile-shrink'] = '1';
            break;
        case 'no-shrink':
            style['--column-mobile-shrink'] = '0';
            break;
    }

    let className = [
        'padding' in props.attributes.dimensions.mobile ? '--has-mobile-padding' : null,
        'margin' in props.attributes.dimensions.mobile ? '--has-mobile-margin' : null,
    ].filter(c => c);

    if ('padding' in props.attributes.dimensions.mobile) {
        Object.entries(props.attributes.dimensions.mobile.padding).forEach((v) => {
            style['--column-mobile-padding-' + v[0]] = v[1];
        })
    }
    if ('margin' in props.attributes.dimensions.mobile) {
        Object.entries(props.attributes.dimensions.mobile.margin).forEach((v) => {
            style['--column-mobile-margin-' + v[0]] = v[1];
        })
    }

    return {
        className: className.join(' '),
        style: style
    };

}

export function Layout({attr = {}, update}) {

    const defaultSettings = Object.assign({}, {
        desktop: {
            display: null,
            align: null,
            justify: null,
            space: null, // flex-grow
            position: null,
            zIndex: null,
            overflow: null,
            wrap: null,
        },
        mobile: {
            display: null,
            align: null,
            justify: null,
            space: null, // flex-grow
            position: null,
            zIndex: null,
            overflow: null,
            wrap: null,
        }
    }, attr);

    const [settings, setSettings] = useState(defaultSettings);

    function updateSettings(tab, prop, val) {
        let result = settings;
        result[tab][prop] = val;
        setSettings(result);
        update(result);
    }

    const options = {
        display: [
            {label: 'Default', value: null},
            {label: 'Row', value: 'row'},
            {label: 'Row Reverse', value: 'row-reverse'},
            {label: 'Column', value: 'column'},
            {label: 'Column Reverse', value: 'column-reverse'},
            {label: 'Block', value: 'block'},
            {label: 'None', value: 'none'},
        ],
        align: [
            {label: 'Default', value: null},
            {label: 'Start', value: 'start'},
            {label: 'Center', value: 'center'},
            {label: 'End', value: 'end'},
            {label: 'Stretch', value: 'stretch'},
        ],
        justify: [
            {label: 'Default', value: null},
            {label: 'Start', value: 'start'},
            {label: 'Center', value: 'center'},
            {label: 'End', value: 'end'},
            {label: 'Between', value: 'between'},
            {label: 'Around', value: 'around'},
        ],
        space: [
            {label: 'Default', value: null},
            {label: 'Grow', value: 'grow'},
            {label: 'Shrink', value: 'shrink'},
            {label: 'No Grow', value: 'no-grow'},
            {label: 'No Shrink', value: 'no-shrink'},
        ],
        position: [
            {label: 'Default', value: null},
            {label: 'Relative', value: 'relative'},
            {label: 'Absolute', value: 'absolute'},
        ],
        overflow: [
            {label: 'Default', value: null},
            {label: 'Hidden', value: 'hidden'},
            {label: 'Visible', value: 'visible'},
        ],
        wrap: [
            {label: 'Default', value: null},
            {label: 'Wrap', value: 'wrap'},
            {label: 'No Wrap', value: 'no-wrap'},
        ]
    };

    function Panels(tab) {
        return <Grid columns={2} columnGap={20} rowGap={30}>
            <SelectControl
                label={'Display'}
                value={settings[tab.name].display}
                options={options.display}
                onChange={(value) => {
                    updateSettings(tab.name, 'display', value);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Align'}
                value={settings[tab.name].align}
                options={options.align}
                onChange={(value) => {
                    updateSettings(tab.name, 'align', value);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Justify'}
                value={settings[tab.name].justify}
                options={options.justify}
                onChange={(value) => {
                    updateSettings(tab.name, 'justify', value);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Space'}
                value={settings[tab.name].space}
                options={options.space}
                onChange={(value) => {
                    updateSettings(tab.name, 'space', value);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Position'}
                value={settings[tab.name].position}
                options={options.position}
                onChange={(value) => {
                    updateSettings(tab.name, 'position', value);
                }}
                __nextHasNoMarginBottom
            />
            <NumberControl
                label="Z-Index"
                value={settings[tab.name].zIndex}
                onChange={(value) => {
                    updateSettings(tab.name, 'zIndex', value);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Overflow'}
                value={settings[tab.name].overflow}
                options={options.overflow}
                onChange={(value) => {
                    updateSettings(tab.name, 'overflow', value);
                }}
                __nextHasNoMarginBottom
            />
            <SelectControl
                label={'Wrap'}
                value={settings[tab.name].wrap}
                options={options.wrap}
                onChange={(value) => {
                    updateSettings(tab.name, 'wrap', value);
                }}
                __nextHasNoMarginBottom
            />
        </Grid>
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
                        className: 'desktop-tab'
                    },
                    {
                        name: 'mobile',
                        title: 'Mobile',
                        className: 'mobile'
                    },
                ]}
                children={(tab) => {
                    return Panels(tab);
                }}
            >
            </TabPanel>
        </PanelBody>

    )
}
