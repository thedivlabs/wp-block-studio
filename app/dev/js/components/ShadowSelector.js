import {
    Dropdown,
    __experimentalGrid as Grid, BaseControl, Icon,
} from "@wordpress/components";
import React from "react";
import {
    useSetting,
} from "@wordpress/block-editor";
import {shadow} from '@wordpress/icons';

export function ShadowSelector({label, value, onChange}) {


    const shadowPresets = useSetting('shadow.presets') || [];

    const shadows = [...shadowPresets?.default ?? [], ...shadowPresets?.theme ?? []];

    console.log(shadows);

    return <Dropdown
        popoverProps={{placement: 'left-start'}}
        renderToggle={({isOpen, onToggle}) => (
            <BaseControl label={'Shadow'}>
                <button
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
                    <Icon icon={shadow} size={24}/>
                    <span>{label}</span>
                </button>
            </BaseControl>
        )}
        renderContent={() => (
            <div style={{padding: '12px', width: '260px'}}>
                <Grid columns={7} columnGap={12} rowGap={12}>
                    <div
                        onClick={() => onChange('')}
                        style={{
                            width: '100%',
                            height: 'auto',
                            aspectRatio: '1/1',
                            border: value === '' ? '2px solid #0073aa' : '1px solid #ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: 4,
                            fontSize: '14px',
                        }}
                        title="None"
                    >
                        <i className="fa-regular fa-xmark"></i>
                    </div>

                    {shadows.map((s) => (
                        <div
                            key={s.slug}
                            onClick={() => onChange(s.shadow)}
                            style={{
                                width: '100%',
                                height: 'auto',
                                aspectRatio: '1/1',
                                border: value === s.shadow ? '2px solid #0073aa' : '1px solid #ddd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                borderRadius: 4,
                                fontSize: '14px',
                            }}
                            title={s.name}
                        />
                    ))}
                </Grid>
            </div>
        )}
    />;
}

