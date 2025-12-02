import {
    DropdownMenu,
    MenuGroup,
    MenuItem,
    ToolbarGroup,
    PanelBody,
    TextControl,
    ToggleControl,
    __experimentalGrid as Grid,
    SelectControl
} from "@wordpress/components";

import {useState, useMemo} from "@wordpress/element";
import {BlockControls} from "@wordpress/block-editor";
import {customLink} from "@wordpress/icons";
import LinkField from "Components/LinkField";

export default function Link({defaultValue = {}, callback, isLoop = false}) {

    const [link, setLink] = useState(defaultValue);

    function update(next) {
        const merged = {...link, ...next};
        setLink(merged);
        callback?.({...merged});
    }

    const sharedProps = {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
    };

    const LinkControl = useMemo(
        () => (
            <LinkField
                label="Link"
                value={link?.url ?? ''}
                onChange={(url) => update({url})}
            />
        ),
        [link?.url]
    );

    return (
        <BlockControls>
            <ToolbarGroup>
                <DropdownMenu icon={customLink} label="Link">
                    {() => (
                        <MenuGroup>
                            <MenuItem>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>

                                    <TextControl
                                        label="Text"
                                        value={link.title}
                                        onChange={(v) => update({title: v})}
                                        style={{gridColumn: '1/-1'}}
                                        {...sharedProps}
                                    />

                                    {LinkControl}

                                    <PanelBody
                                        title="Advanced Settings"
                                        initialOpen={false}
                                        className="is-style-unstyled"
                                    >

                                        {isLoop && (
                                            <Grid
                                                columns={2}
                                                columnGap={15}
                                                rowGap={20}
                                                style={{marginTop: '15px'}}
                                            >
                                                <ToggleControl
                                                    label="Link current post"
                                                    checked={!!link.linkPost}
                                                    onChange={(v) => update({linkPost: v})}
                                                />
                                            </Grid>
                                        )}

                                        <Grid columns={2} columnGap={15} rowGap={20} style={{marginTop: '15px'}}>
                                            <ToggleControl
                                                label="Open in new tab"
                                                checked={!!link.linkNewTab}
                                                onChange={(v) => update({linkNewTab: v})}
                                            />
                                        </Grid>

                                        <Grid
                                            columns={2}
                                            columnGap={15}
                                            rowGap={20}
                                            style={{marginTop: '15px'}}
                                        >
                                            <TextControl
                                                label="Title attribute"
                                                value={link.alt}
                                                onChange={(v) => update({alt: v})}
                                                style={{gridColumn: '1/-1'}}
                                                {...sharedProps}
                                            />

                                            <TextControl
                                                label="ARIA Label"
                                                value={link.ariaLabel}
                                                onChange={(v) => update({ariaLabel: v})}
                                                style={{gridColumn: '1/-1'}}
                                                {...sharedProps}
                                            />

                                            <TextControl
                                                label="Anchor ID"
                                                value={link.id}
                                                onChange={(v) => update({id: v})}
                                                {...sharedProps}
                                            />

                                            <SelectControl
                                                label="rel"
                                                value={link.rel}
                                                {...sharedProps}
                                                options={[
                                                    {label: "Select", value: ""},
                                                    {label: "nofollow", value: "nofollow"},
                                                    {label: "ugc", value: "ugc"},
                                                    {label: "sponsored", value: "sponsored"},
                                                    {label: "nofollow + ugc", value: "nofollow ugc"},
                                                    {label: "nofollow + sponsored", value: "nofollow sponsored"},
                                                    {label: "ugc + sponsored", value: "ugc sponsored"},
                                                    {
                                                        label: "nofollow + ugc + sponsored",
                                                        value: "nofollow ugc sponsored"
                                                    },
                                                ]}
                                                onChange={(v) => update({rel: v})}
                                            />
                                        </Grid>
                                    </PanelBody>

                                </div>
                            </MenuItem>
                        </MenuGroup>
                    )}
                </DropdownMenu>
            </ToolbarGroup>
        </BlockControls>
    );
}


// utils/linkProps.js

export function getAnchorProps(settings = {}) {
    const {
        url = "",
        linkPost = false,
        linkNewTab = false,
        title = "",
        ariaLabel = "",
        id = "",
        rel = "",
        alt = "",
    } = settings;

    const props = {};

    // Determine href
    if (linkPost) {
        props.href = "%%__POST_LINK_URL__%%";
    } else if (url) {
        props.href = url;
    }

    if (id) props.id = id;
    if (title) props.title = title;
    if (ariaLabel) props['aria-label'] = ariaLabel;
    if (alt) props['title'] = alt;
    if (rel) props.rel = rel;

    if (linkNewTab) {
        props.target = "_blank";

        if (!rel || !rel.includes("noopener") || !rel.includes("noreferrer")) {
            const safe = ["noopener", "noreferrer"];
            props.rel = rel ? `${rel} ${safe.join(" ")}` : safe.join(" ");
        }
    }

    return props;
}

