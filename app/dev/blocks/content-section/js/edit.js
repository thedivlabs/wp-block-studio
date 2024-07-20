import {useBlockProps, BlockEdit,InspectorControls,PanelColorSettings,RichText} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"

registerBlockType(metadata.name, {
    attributes: {
        content: {
            type: 'string',
            source: 'html',
            selector: 'div',
        }
    },
    edit: ({attributes, setAttributes, isSelected, blockProps}) => {

        function onChangeContent( newContent ) {
            setAttributes( { content: newContent } );
        }

        return (
            <>
                <RichText
                    { ...blockProps }
                    key="editable"
                    tagName="p"
                    onChange={ onChangeContent }
                    value={ content }
                />
            </>
        )
    },
    save: ({attributes}) => {
        const blockProps = useBlockProps.save({
            className: 'wpbs-content-section'
        });
        return <div {...blockProps}>
            <RichText.Content value={attributes.content} tagName="p"/>
            aaaaaaa
        </div>;
    }
})


