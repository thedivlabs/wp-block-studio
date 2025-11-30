export const IconControl = ({
                                fieldKey,
                                props,
                                value = {},
                                onChange,
                                label = "Icon",
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
            gradient: obj.gradient || "",
        };

        normalized.css = generateCSS(
            normalized.style === "solid" ? 1 : 0,
            normalized.weight,
            normalized.size
        );

        return normalized;
    };

    /* ------------------------------------------------------------
       UPDATE — Now accepts ONE object of changes
    ------------------------------------------------------------ */
    const update = useCallback(
        (patch) => {
            if (!patch || typeof patch !== "object") return;

            setLocal((prev) => {
                const next = {...prev, ...patch};
                const normalized = normalize(next);

                // send normalized object UP
                onChange(normalized);

                // sync registry
                const nextIcons =
                    normalized.name.length > 0
                        ? [
                            ...icons.filter((icon) => icon.key !== fieldId),
                            {
                                key: fieldId,
                                name: normalized.name,
                                fill: normalized.style === "solid" ? 1 : 0,
                                weight: normalized.weight,
                                opsz: normalized.size,
                                grade: Number(normalized.grade ?? 0),
                                color: normalized.color,
                                gradient: normalized.gradient,
                            },
                        ]
                        : icons.filter((i) => i.key !== fieldId);

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
    const {name, weight = 300, size = 32, style = "outlined", color = "", gradient = ""} =
        local;

    const labelNode = (
        <>
            <span>Icon </span>
            <a
                href="https://fonts.google.com/icons"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    verticalAlign: "text-bottom",
                    lineHeight: "inherit",
                    height: "1em",
                    width: "fit-content",
                    marginLeft: "2px",
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
                    onChange={(val) => update({name: val})}
                    placeholder="Icon name"
                    style={{flex: 1}}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />

                <IconPreview name={name} style={style} settings={local}/>

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
                                    onChange={(val) => update({size: Number(val)})}
                                />

                                <SelectControl
                                    label="Weight"
                                    value={weight}
                                    onChange={(val) => update({weight: Number(val)})}
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
                                    onChange={(val) => update({style: val})}
                                    options={[
                                        {value: "outlined", label: "Outlined"},
                                        {value: "solid", label: "Solid (Filled)"},
                                    ]}
                                />

                                <ColorSelector
                                    label="Icon Color"
                                    value={color || gradient}
                                    normalize={false}
                                    onChange={(val) =>
                                        update({
                                            color: val?.color ?? "",
                                            gradient: val?.gradient ?? "",
                                        })
                                    }
                                />
                            </Grid>
                        </Popover>
                    )}
                </div>
            </div>
        </BaseControl>
    );
};
