import {
    Dropdown,
    __experimentalGrid as Grid, BaseControl, Icon,
} from "@wordpress/components";
import {
    useSetting,
} from "@wordpress/block-editor";
import {shadow} from '@wordpress/icons';

export function ShadowSelector({label = 'Shadow', value, onChange}) {


    const shadowPresets = useSetting('shadow.presets') || [];

    const shadows = [{
        name: 'None',
        slug: 'none',
        shadow: 'none'
    }, ...(shadowPresets?.default ?? []), ...(shadowPresets?.theme ?? [])];

    const cardStyle = {
        width: '100%',
        height: 'auto',
        aspectRatio: '1/1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        borderRadius: 4,
        fontSize: '14px',
    };

    return <Dropdown
        style={{width: '100%'}}
        popoverProps={{placement: 'left-start'}}
        renderToggle={({isOpen, onToggle}) => (
            <BaseControl label={label}>
                <button
                    onClick={onToggle}
                    aria-expanded={isOpen}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: '8px',
                        padding: '8px',
                        height: '40px',
                        border: '1px solid #ddd',
                        width: '100%',
                    }}
                >
                    <Icon icon={shadow} size={24}/>
                    <span>{value?.name ?? 'Select'}</span>
                </button>
            </BaseControl>
        )}
        renderContent={() => (
            <div style={{padding: '12px', width: '260px'}}>
                <Grid columns={6} columnGap={12} rowGap={12}>
                    {shadows.map((s) => (
                        <div
                            role="button"
                            aria-pressed={value?.shadow === s.shadow}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onChange(s);
                            }}
                            key={s.slug}
                            onClick={() => onChange(s)}
                            style={{
                                ...cardStyle,
                                border: value?.shadow === s.shadow ? '2px solid #0073aa' : '1px solid #ddd',
                                boxShadow: s.shadow,
                            }}
                            title={s.name}
                        />
                    ))}
                </Grid>
            </div>
        )}
    />;
}

