import React, {useCallback, useEffect, useMemo, useState} from "react";
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
            'loop': false,
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

export const gridProps = (attributes) => {

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
};


export const GridControls = ({attributes, setAttributes}) => {

    const grid = attributes?.['wpbs-grid'] ?? {};

    const updateSettings = useCallback((newValue) => {

        const result = {
            ...grid,
            ...newValue
        };

        result.loop = (attributes?.className ?? '').includes('is-style-loop');

        setAttributes({
            'wpbs-grid': result,
        });

    }, [grid, setAttributes]);


    return <Grid columns={1} columnGap={15} rowGap={20}>
        <BaseControl label={'Grid Columns'} __nextHasNoMarginBottom={true}>
            <Grid columns={3} columnGap={15} rowGap={20}>
                <NumberControl
                    label={'Mobile'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => updateSettings({'columns-mobile': newValue})}
                    value={grid?.['columns-mobile']}
                />
                <NumberControl
                    label={'Small'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => updateSettings({'columns-small': newValue})}
                    value={grid?.['columns-small']}
                />
                <NumberControl
                    label={'Large'}
                    __next40pxDefaultSize
                    isShiftStepEnabled={false}
                    onChange={(newValue) => updateSettings({'columns-large': newValue})}
                    value={grid?.['columns-large']}
                />
            </Grid>
        </BaseControl>
        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
            <Breakpoint
                label={'Breakpoint SM'}
                defaultValue={grid?.['breakpoint-small']}
                callback={(newValue) => updateSettings({'breakpoint-small': newValue})}/>
            <Breakpoint
                label={'Breakpoint LG'}
                defaultValue={grid?.['breakpoint-large']}
                callback={(newValue) => updateSettings({'breakpoint-large': newValue})}/>
        </Grid>
        <Grid columns={2} columnGap={15} rowGap={20} style={{padding: '10px 0'}}>
            <ToggleControl
                __nextHasNoMarginBottom
                label="Masonry"
                checked={!!grid?.['masonry']}
                onChange={(newValue) => updateSettings({'masonry': newValue})}
            />
        </Grid>
        <BorderControl
            __next40pxDefaultSize
            enableAlpha
            enableStyle
            disableUnits
            value={grid?.['divider'] || {}}
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
                value={grid?.['divider-icon']}
                onChange={(newValue) => updateSettings({'divider-icon': newValue})}
            />
            <UnitControl
                label={'Icon Size'}
                value={grid?.['divider-icon-size']}
                isResetValueOnUnitChange={true}
                onChange={(newValue) => updateSettings({'divider-icon-size': newValue})}
                units={[
                    {value: 'px', label: 'px', default: '0px'},
                    {value: 'em', label: 'em', default: '0em'},
                    {value: 'rem', label: 'rem', default: '0rem'},
                    {value: 'vw', label: 'vw', default: '0vw'},
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
                    value: grid?.['divider-icon-color'],
                    onChange: (newValue) => updateSettings({'divider-icon-color': newValue}),
                    isShownByDefault: true
                }
            ]}
        />
    </Grid>

};



