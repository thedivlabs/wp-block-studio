import React, {useCallback, useEffect, useState} from "react";
import {
    __experimentalBorderControl as BorderControl,
    __experimentalGrid as Grid, __experimentalInputControl as InputControl,
    __experimentalNumberControl as NumberControl, __experimentalUnitControl as UnitControl, BaseControl,
    ToggleControl
} from "@wordpress/components";
import Breakpoint from "Components/Breakpoint.js";
import {PanelColorSettings} from "@wordpress/block-editor";

export const GRID_ATTRIBUTES = {
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
}

export const GridControls = ({attributes, setAttributes}) => {

    const updateSettings = useCallback((newValue) => {

        const result = {
            ...attributes['wpbs-grid'],
            ...newValue
        };

        setAttributes({
            'wpbs-grid': result
        });


    }, [attributes['wpbs-grid'], setAttributes]);


    return <Grid columns={1} columnGap={15} rowGap={20}>
        <BaseControl label={'Grid Columns'} __nextHasNoMarginBottom={true}>
            <Grid columns={3} columnGap={15} rowGap={20}>
                <NumberControl
                    label={'Mobile'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => updateSettings({'columns-mobile': newValue})}
                    value={attributes['columns-mobile']}
                />
                <NumberControl
                    label={'Small'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => updateSettings({'columns-small': newValue})}
                    value={attributes['columns-small']}
                />
                <NumberControl
                    label={'Large'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => updateSettings({'columns-large': newValue})}
                    value={attributes['columns-large']}
                />
            </Grid>
        </BaseControl>
        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
            <Breakpoint
                label={'Breakpoint SM'}
                defaultValue={attributes['breakpoint-small']}
                callback={(newValue) => updateSettings({'breakpoint-small': newValue})}/>
            <Breakpoint
                label={'Breakpoint LG'}
                defaultValue={attributes['breakpoint-large']}
                callback={(newValue) => updateSettings({'breakpoint-large': newValue})}/>
        </Grid>
        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
            <ToggleControl
                __nextHasNoMarginBottom
                label="Masonry"
                checked={!!attributes['masonry']}
                onChange={(newValue) => updateSettings({'masonry': newValue})}
            />
        </Grid>
        <BorderControl
            __next40pxDefaultSize
            enableAlpha
            enableStyle
            disableUnits
            value={attributes['divider'] || {}}
            colors={WPBS?.settings?.colors ?? []}
            __experimentalIsRenderedInSidebar={true}
            label="Divider"
            onChange={(newValue) => updateSettings({'divider': newValue})}
            shouldSanitizeBorder
        />
        <Grid columns={2} columnGap={15} rowGap={20}>

            <InputControl
                label={'Divider Icon'}
                __next40pxDefaultSize
                value={attributes['divider-icon']}
                onChange={(newValue) => updateSettings({'divider-icon': newValue})}
            />
            <UnitControl
                label={'Icon Size'}
                value={attributes['divider-icon-size']}
                isResetValueOnUnitChange={true}
                onChange={(newValue) => updateSettings({'divider-icon-size': newValue})}
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
                    value: attributes['divider-icon-color'],
                    onChange: (newValue) => updateSettings({'divider-icon-color': newValue}),
                    isShownByDefault: true
                }
            ]}
        />
    </Grid>
};



