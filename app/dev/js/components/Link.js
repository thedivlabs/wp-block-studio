import {
    DropdownMenu, MenuGroup, MenuItem, SelectControl, TextControl, ToolbarGroup,
    __experimentalGrid as Grid
} from "@wordpress/components";
import React, {useState} from "react";
import {__experimentalLinkControl as LinkControl, BlockControls} from "@wordpress/block-editor";
import {customLink} from "@wordpress/icons";

function Link({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <BlockControls>
        <ToolbarGroup>
            <DropdownMenu
                icon={customLink}
                label={'Link'}
            >
                {({onClose}) => (
                    <MenuGroup>
                        <MenuItem>
                            <LinkControl
                                searchInputPlaceholder="Search here..."
                                allowDirectEntry={true}
                                //forceIsEditingLink={true}
                                hasTextControl={true}
                                value={value}
                                settings={[
                                    {
                                        id: 'opensInNewTab',
                                        title: 'Open in new tab',
                                    }
                                ]}
                                onChange={(newValue) => {
                                    setValue(newValue);
                                    callback(newValue);
                                }}
                                //withCreateSuggestion={true}
                            ></LinkControl>
                        </MenuItem>
                    </MenuGroup>
                )}
            </DropdownMenu>
        </ToolbarGroup>
    </BlockControls>;
}

export default Link;
