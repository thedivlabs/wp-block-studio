import {
    DropdownMenu, MenuGroup, MenuItem, ToolbarGroup
} from "@wordpress/components";
import React from "react";
import {__experimentalLinkControl as LinkControl, BlockControls} from "@wordpress/block-editor";
import {customLink} from "@wordpress/icons";

function Link({defaultValue, callback}) {


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
                                value={defaultValue}
                                settings={[
                                    {
                                        id: 'opensInNewTab',
                                        title: 'Open in new tab',
                                    }
                                ]}
                                onChange={(newValue) => callback}
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
