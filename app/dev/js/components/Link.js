import {
    DropdownMenu,
    MenuGroup,
    MenuItem,
    ToolbarGroup,
    PanelBody,
    TextControl,
    ToggleControl,
    __experimentalGrid as Grid
} from "@wordpress/components";


import {useState} from "@wordpress/element";
import {
    __experimentalLinkControl as LinkControl,
    BlockControls
} from "@wordpress/block-editor";

import {customLink} from "@wordpress/icons";


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


    return (
        <BlockControls>
            <ToolbarGroup>
                <DropdownMenu icon={customLink} label="Link">
                    {() => (
                        <MenuGroup>
                            <MenuItem>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                    <LinkControl
                                        searchInputPlaceholder="Search…"
                                        allowDirectEntry={true}
                                        forceIsEditingLink={true}
                                        hasTextControl={true}
                                        settings={[]}
                                        value={{
                                            url: link.url,
                                        }}
                                        onChange={(value) => {
                                            update({
                                                url: value?.url || "",
                                                linkNewTab: !!value?.linkNewTab
                                            });
                                        }}
                                        withCreateSuggestion={true}
                                    />


                                    <PanelBody title="Advanced Settings" initialOpen={false}>
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
                                            />

                                            <TextControl
                                                label="ARIA Label"
                                                value={link.ariaLabel}
                                                onChange={(v) => update({ariaLabel: v})}
                                                style={{gridColumn: '1/-1'}}
                                            />

                                            <TextControl
                                                label="Anchor ID"
                                                value={link.id}
                                                onChange={(v) => update({id: v})}
                                            />

                                            <TextControl
                                                label="rel"
                                                value={link.rel}
                                                placeholder="nofollow ugc sponsored"
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