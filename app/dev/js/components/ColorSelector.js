import {
    ColorIndicator, Dropdown,
} from "@wordpress/components";
import React, {useMemo} from "react";
import {
    __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";

export function ColorSelector({label, value, onColorChange}) {


    const {colors, gradients} = useMemo(() => {

        const editorColors = wp.data.select('core/editor').getEditorSettings().colors || [];
        const editorGradients = wp.data.select('core/editor').getEditorSettings().gradients || [];


        console.log(editorColors);
        console.log(editorGradients);

        return {
            colors: editorColors,
            gradients: editorGradients,
        }
    }, []);

    return <Dropdown
        style={{width: '100%'}}
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
            <div style={{padding: '12px', width: '100%'}}>
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

