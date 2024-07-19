import {useBlockProps} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

registerBlockType(metadata.name, {
    edit: ( { attributes, setAttributes, isSelected } ) => {
        const blockProps = useBlockProps();

        const { content, mySetting } = attributes;

        return (
            <div { ...blockProps }>
                { content }
            </div>
        );
    },
    save: ()=> {
        const blockProps = useBlockProps.save();
        return <div { ...blockProps }> Your block. </div>;
    }
})


