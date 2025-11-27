import {
    BaseControl,
    TextControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl,
    Button,
    Popover,
} from '@wordpress/components';
import {useSetting} from "@wordpress/block-editor";
import {useEffect, useMemo, useState, memo, useCallback} from "@wordpress/element";
import {debounce, isEqual} from "lodash";
import {cleanObject} from "Includes/helper";

/* ------------------------------------------------------------
 * CSS utility for Material Symbols variable font
 * ------------------------------------------------------------ */
const generateCSS = (fill, weight, opsz) => {
    return `'FILL' ${Number(fill) || 0}, 'wght' ${weight || 300}, 'GRAD' 0, 'opsz' ${opsz || 24}`;
};

/* ------------------------------------------------------------
 * SVG preview component
 * ------------------------------------------------------------ */
const FAMILY_MAP = {
    solid: "materialsymbols",
    outlined: "materialsymbolsoutlined",
    default: "materialsymbolsoutlined",
};

const IconPreview = memo(
    ({name = 'home', style = 'outlined'}) => {
        const family = FAMILY_MAP[style] ?? FAMILY_MAP.outlined;
        const url = `https://fonts.gstatic.com/s/i/short-term/release/${family}/${name}/default/24px.svg`;

        const previewStyle = {
            flexGrow: 0,
            width: '32px',
            height: '32px',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            objectFit: 'contain',
            objectPosition: 'center',
            verticalAlign: 'middle',
        };

        return <img src={url} alt={name} style={previewStyle}/>;
    },
    (prev, next) => isEqual(prev, next)
);

/* ------------------------------------------------------------
 * Main IconControl
 * ------------------------------------------------------------ */
export const IconControl = ({
                                fieldKey,
                                props,
                                value = {},
                                onChange,
                                label = 'Icon',
                                isCommit = true,
                            }) => {

    /* --------------------------------------------
     * Local state for the full icon object
     * -------------------------------------------- */
    const [local, setLocal] = useState(value);
    const [isOpen, setIsOpen] = useState(false);

    // Important: unique key so cloned blocks don't collide
    const fieldId = `${fieldKey}-${props.clientId}`;

    const icons = props.attributes["wpbs-icons"] || [];

    /* --------------------------------------------
     * Debounced commit function
     * -------------------------------------------- */
    const commit = useCallback((next) => {

        const normalized = {
            ...next,
            name: next.name || "",
            weight: Number(next.weight ?? 300),
            size: Number(next.size ?? 24),
            style: next.style ?? "outlined",
        };

        // Generate CSS variation string
        normalized.css = generateCSS(
            normalized.style === "solid" ? 1 : 0,
            normalized.weight,
            normalized.size
        );

        // 1. Update block-local field
        onChange(normalized);

        // 2. Update wpbs-icons (keep everyone else)
        const nextIcons = [
            ...icons.filter((icon) => icon.key !== fieldId),
            normalized.name
                ? {
                    key: fieldId,
                    name: normalized.name,
                    // Fill axis: solid → 1, outlined → 0
                    fill: normalized.style === "solid" ? 1 : 0,
                    weight: normalized.weight,
                    opsz: normalized.size,
                    grade: Number(normalized.grade ?? 0),
                }
                : null,
        ].filter(Boolean);

        if (!!isCommit) {
            props.setAttributes({"wpbs-icons": nextIcons});
        }

    }, [onChange, props.setAttributes]);

    /* -------------------------------------------
     * Sync external changes back into local
     * -------------------------------------------- */
    useEffect(() => {
        if (!isEqual(cleanObject(local, true), cleanObject(value, true))) {
            setLocal(value);
        }
    }, [value]);

    /* --------------------------------------------
     * Update local only
     * -------------------------------------------- */
    const update = (key, val) => {
        if (isEqual(cleanObject(local, true), cleanObject(value, true))) {
            return
        }
        setLocal((prev) => ({
            ...prev,
            [key]: val,
        }));
        commit(local);

    };

    const {name, weight = 300, size = 24, style = "outlined"} = local;

    const labelNode = (
        <><span>
        Icon{' '}
    </span>
            <a
                href="https://fonts.google.com/icons"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    verticalAlign: 'text-bottom',
                    lineHeight: 'inherit',
                    height: '1em',
                    width: 'fit-content',
                    marginLeft: '2px',
                }}
            >
                <MaterialIcon name="help" size={15} style="outlined" weight={400}/>
            </a>
        </>
    );

    /* --------------------------------------------
     * UI
     * -------------------------------------------- */
    return (
        <BaseControl label={labelNode} style={{marginBottom: 0}}>
            <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <TextControl
                    value={name}
                    onChange={(val) => update("name", val)}
                    placeholder="Icon name"
                    style={{flex: 1}}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />

                <IconPreview name={name} style={style}/>

                <div>
                    <Button
                        variant="secondary"
                        onClick={() => setIsOpen(!isOpen)}
                        icon="admin-generic"
                    />

                    {isOpen && (
                        <Popover
                            position="bottom right"
                            onClose={() => setIsOpen(false)}
                        >
                            <Grid
                                columns={1}
                                rowGap={15}
                                style={{padding: "10px", width: "200px"}}
                            >
                                <NumberControl
                                    label="Size"
                                    value={size}
                                    onChange={(val) => update("size", val)}
                                    min={6}
                                    max={120}
                                    step={1}
                                />

                                <SelectControl
                                    label="Weight"
                                    value={weight}
                                    onChange={(val) => update("weight", Number(val))}
                                    options={[
                                        {value: 100, label: 100},
                                        {value: 200, label: 200},
                                        {value: 300, label: 300},
                                        {value: 400, label: 400},
                                        {value: 500, label: 500},
                                        {value: 600, label: 600},
                                    ]}
                                />

                                <SelectControl
                                    label="Style"
                                    value={style}
                                    onChange={(val) => update("style", val)}
                                    options={[
                                        {value: "outlined", label: "Outlined"},
                                        {value: "solid", label: "Solid (Filled)"},
                                    ]}
                                />
                            </Grid>
                        </Popover>
                    )}
                </div>
            </div>
        </BaseControl>
    );
};

/* ------------------------------------------------------------
 * Frontend renderer
 * ------------------------------------------------------------ */
export const MaterialIcon = ({
                                 isEditor = false,
                                 name,
                                 weight = 300,
                                 size,
                                 style = "outlined",
                                 className = "",
                             }) => {
    const css = `'FILL' ${style === "solid" ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${
        size || 24
    }`;

    const iconStyle = {
        fontVariationSettings: css,
        display: "inline-flex",
        fontSize: `${size}px`,
        fontWeight: `${weight}`,
    };

    return !name ? null : (
        <span
            className={`material-symbols-outlined wpbs-icon ${className}`}
            style={iconStyle}
        >
            {name}
        </span>
    );
};
