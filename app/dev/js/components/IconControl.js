import {
    BaseControl,
    TextControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    SelectControl,
    Button,
    Popover,
} from '@wordpress/components';
import {useEffect, useState, memo, useCallback} from "@wordpress/element";
import {isEqual} from "lodash";
import {ColorSelector} from "Components/ColorSelector";

const generateCSS = (fill, weight, opsz) =>
    `'FILL' ${Number(fill) || 0}, 'wght' ${weight || 300}, 'GRAD' 0, 'opsz' ${opsz || 24}`;

const FAMILY_MAP = {
    solid: "materialsymbols",
    outlined: "materialsymbolsoutlined",
    default: "materialsymbolsoutlined",
};

const IconPreview = memo(
    ({name: selectedName, style = "outlined", weight = 300, size = 32, color = ""}) => {
        const name =
            typeof selectedName === "string" && selectedName.trim().length
                ? selectedName.trim()
                : "home";

        return (
            <span
                className="material-symbols-outlined"
                style={{
                    fontVariationSettings: `'FILL' ${style === "solid" ? 1 : 0},
                                             'wght' ${weight},
                                             'GRAD' 0,
                                             'opsz' ${size}`,
                    fontSize: `${size}px`,
                    lineHeight: 1,
                    color: color || "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                }}
            >
                {name}
            </span>
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
                            }) => {

    const {updateEditorIcons} = window?.WPBS_StyleEditor ?? {};

    const [local, setLocal] = useState(value);
    const [isOpen, setIsOpen] = useState(false);

    const icons = props.attributes["wpbs-icons"] || [];
    const fieldId = fieldKey;


    /* ------------------------------------------------------------
       NORMALIZER — Turns local state into a clean icon object
    ------------------------------------------------------------ */
    const normalize = (obj) => {
        const normalized = {
            name: obj.name || "",
            weight: Number(obj.weight ?? 300),
            size: Number(obj.size ?? 24),
            style: obj.style ?? "outlined",
            color: obj.color || "",
        };

        normalized.css = generateCSS(
            normalized.style === "solid" ? 1 : 0,
            normalized.weight,
            normalized.size
        );

        return normalized;
    };


    /* ------------------------------------------------------------
       UPDATE — Single passthrough update handler, immediate
    ------------------------------------------------------------ */
    const update = useCallback(
        (key, val) => {
            setLocal((prev) => {
                const next = {...prev, [key]: val};
                const normalized = normalize(next);
                console.log(normalized);
                // send normalized object UP immediately
                onChange(normalized);

                // update registry immediately
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
                            color: normalized.color,
                        }
                        : null,
                ].filter(Boolean);

                props.setAttributes({"wpbs-icons": nextIcons});

                if (typeof updateEditorIcons === "function") {
                    updateEditorIcons(nextIcons);
                }

                return next;
            });
        },
        [icons, fieldId, onChange, props.setAttributes, updateEditorIcons]
    );


    /* ------------------------------------------------------------
       UI
    ------------------------------------------------------------ */
    const {name, weight = 300, size = 32, style = "outlined", color = ""} = local;

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
                                    min={6}
                                    max={120}
                                    step={1}
                                    onChange={(val) => update("size", val)}
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
                                    label="Icon Color"
                                    value={color}
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
