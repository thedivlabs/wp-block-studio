import {
    ColorIndicator, Dropdown,
} from "@wordpress/components";
import React, {useMemo, useState} from "react";
import {
    __experimentalColorGradientControl as ColorGradientControl,
    useSetting
} from "@wordpress/block-editor";

export function ColorSelector({label, value, onColorChange}) {


    const {colors, gradients} = useMemo(() => {
        const editorColors = useSetting('color.colors') || [];
        const editorGradients = useSetting('color.gradients') || [];


        return {
            colors: editorColors,
            gradients: editorGradients,
        }
    }, []);

    return <Dropdown
        popoverProps={{placement: 'left-start'}}
        renderToggle={({isOpen, onToggle}) => (
            <div
                onClick={onToggle}
                aria-expanded={isOpen}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '8px',
                    padding: '10px 12px',
                    height: '40px',
                    border: '1px solid #ddd',
                    width: '100%',
                }}
            >
                <ColorIndicator colorValue={value}/>
                <span>{label}</span>
            </div>
        )}
        renderContent={() => (
            <div style={{padding: '12px', width: '260px'}}>
                <ColorGradientControl
                    label={label}
                    colorValue={value}
                    onColorChange={onColorChange}
                    enableAlpha
                    colors={colors}
                    gradients={gradients}
                />
            </div>
        )}
    />;
}

