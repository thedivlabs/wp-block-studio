import {
    BaseControl,
    TextControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl,
    Button,
    Popover, ColorPalette,
} from '@wordpress/components';
import {useEffect, useState, memo, useCallback, useMemo} from "@wordpress/element";
import {debounce, isEqual} from "lodash";
import { ColorSelector } from "Components/ColorSelector";

const generateCSS = (fill, weight, opsz) =>
    `'FILL' ${Number(fill) || 0}, 'wght' ${weight || 300}, 'GRAD' 0, 'opsz' ${opsz || 24}`;

const FAMILY_MAP = {
    solid: "materialsymbols",
    outlined: "materialsymbolsoutlined",
    default: "materialsymbolsoutlined",
};

const IconPreview = memo(
    ({name = 'home', style = 'outlined'}) => {
        const family = FAMILY_MAP[style] ?? FAMILY_MAP.outlined;
        const url = `https://fonts.gstatic.com/s/i/short-term/release/${family}/${name}/default/24px.svg`;

        return (
            <img
                src={url}
                alt={name}
                style={{
                    flexGrow: 0,
                    width: '32px',
                    height: '32px',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    verticalAlign: 'middle',
                }}
            />
        );
    },
    (prev, next) => isEqual(prev, next)
);

export const IconControl = ({
                                fieldKey,
                                props,
                                value = {},
                                onChange,
                                label = 'Icon',
                                isCommit = true,
                            }) => {

    const {updateEditorIcons} = window?.WPBS_StyleEditor ?? {};

    const [local, setLocal] = useState(value);
    const [isOpen, setIsOpen] = useState(false);

    const icons = props.attributes["wpbs-icons"] || [];

    //const fieldId = `${fieldKey}-${props.clientId}`;
    const fieldId = fieldKey;


    const debouncedRegistryCommit = useMemo(
        () =>
            debounce((normalized) => {
                //if (!isCommit) return;

                const nextIcons = [
                    ...icons.filter((icon) => icon.key !== fieldId),
                    normalized.name
                        ? {
                            key: fieldId,
                            name: normalized.name,
                            fill: normalized.style === "solid" ? 1 : 0,
                            weight: normalized.weight,
                            opsz: normalized.size,
                            grade: Number(normalized.grade ?? 0),
                            color: normalized.color || "",   // <-- 🔥 ADD THIS LINE
                        }
                        : null,
                ].filter(Boolean);

                props.setAttributes({"wpbs-icons": nextIcons});

                if (typeof updateEditorIcons === "function") {
                    updateEditorIcons(nextIcons);
                }


            }, 1500),
        [icons, fieldId, props.setAttributes, updateEditorIcons]
    );


    const update = useCallback(
        (key, val) => {
            setLocal((prev) => {
                const next = {...prev, [key]: val};

                // create the clean normalized icon object immediately
                const normalized = {
                    ...next,
                    name: next.name || "",
                    weight: Number(next.weight ?? 300),
                    size: Number(next.size ?? 24),
                    style: next.style ?? "outlined",
                    color: next.color || "",
                };

                normalized.css = generateCSS(
                    normalized.style === "solid" ? 1 : 0,
                    normalized.weight,
                    normalized.size
                );

                // send normalized object UP to HOC immediately
                onChange(normalized);

                // fire delayed registry update
                debouncedRegistryCommit(normalized);

                return next;
            });
        },
        [debouncedRegistryCommit, onChange]
    );


    useEffect(() => {
        if (!isEqual(value, local)) {
            setLocal(value);
        }
    }, [value]);

    const {name, weight = 300, size = 24, style = "outlined"} = local;

    const labelNode = (
        <>
            <span>Icon </span>
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


                                <ColorSelector
                                    label={'Icon Color'}
                                    value={local.color}
                                    onChange={(val) => update("color", val)}
                                />
                            </Grid>
                        </Popover>
                    )}
                </div>
            </div>
        </BaseControl>
    );
};

export const MaterialIcon = ({
                                 name,
                                 weight = 300,
                                 size,
                                 style = "outlined",
                                 className = "",
                             }) => {
    const css = `'FILL' ${style === "solid" ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${
        size || 24
    }`;

    return !name ? null : (
        <span
            className={`material-symbols-outlined wpbs-icon ${className}`}
            style={{
                fontVariationSettings: css,
                display: "inline-flex",
                fontSize: `${size}px`,
                fontWeight: `${weight}`,
            }}
        >
            {name}
        </span>
    );
};
