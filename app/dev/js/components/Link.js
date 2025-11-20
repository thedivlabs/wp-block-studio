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


import {useState} from "@wordpress/element";
import {
    BlockControls
} from "@wordpress/block-editor";

import {customLink} from "@wordpress/icons";
import LinkField from "Components/LinkField";


export default function Link({defaultValue = {}, callback}) {

    // unified link state
    const [link, setLink] = useState({
        url: defaultValue.url || "",
        linkNewTab: defaultValue.linkNewTab || false,
        title: defaultValue.title || "",
        ariaLabel: defaultValue.ariaLabel || "",
        id: defaultValue.id || "",
        rel: defaultValue.rel || "",
        // add any custom keys here
    });


    // one update fn for everything
    function update(next) {
        const merged = {...link, ...next};
        setLink(merged);
        callback?.(merged);
    }

    const sharedProps = {
        __nextHasNoMarginBottom: true,
        __next40pxDefaultSize: true,
    }


    return (
        <BlockControls>
            <ToolbarGroup>
                <DropdownMenu icon={customLink} label="Link">
                    {() => (
                        <MenuGroup>
                            <MenuItem>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>

                                    <LinkField
                                        label="Link"
                                        checked={!!link.url}
                                        onChange={(v) => update({url: v})}
                                    />


                                    <PanelBody title="Advanced Settings" initialOpen={false}
                                               className="is-style-unstyled">
                                        <Grid columns={2} columnGap={15} rowGap={20} style={{marginTop: '15px'}}>
                                            <ToggleControl
                                                label="Open in new tab"
                                                checked={!!link.linkNewTab}
                                                onChange={(v) => update({linkNewTab: v})}
                                            />

                                            <ToggleControl
                                                label="Open in new window"
                                                checked={!!link.newWindow}
                                                onChange={(v) => update({newWindow: v})}
                                            />

                                            <TextControl
                                                label="Title attribute"
                                                value={link.title}
                                                onChange={(v) => update({title: v})}
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