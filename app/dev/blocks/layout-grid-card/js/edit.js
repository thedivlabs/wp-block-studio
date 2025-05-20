import {
    useBlockProps,
    InspectorControls,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {layoutAttributes, LayoutControls, layoutCss} from "Components/Layout"
import {backgroundAttributes, BackgroundControls, BackgroundElement, backgroundCss} from "Components/Background"
import {Style, styleAttributes} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect} from "react";


function sectionClassNames(attributes = {}) {

    return [
        'wpbs-layout-grid-card w-full block relative',
        attributes.uniqueId,
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...layoutAttributes,
        ...backgroundAttributes,
        ...styleAttributes,
    },
    edit: ({attributes, setAttributes, context, clientId}) => {


        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid-card');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});

        }, []);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });


        return (
            <>
                <Style attributes={attributes} setAttributes={setAttributes}
                       uniqueId={uniqueId}
                       css={[backgroundCss(attributes), layoutCss(attributes)]}
                       deps={['wpbs-layout', 'wpbs-background']}
                />
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>


                <div {...blockProps}>
                    <div {...useInnerBlocksProps({
                        className: 'wpbs-layout-grid-card__container wpbs-layout-wrapper relative z-20',
                    })} />
                    <BackgroundElement attributes={props.attributes} editor={true}/>
                </div>


            </>
        )
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: sectionClassNames(props.attributes),
        });


        return <div {...blockProps}>
            <div {...useInnerBlocksProps.save({
                className: 'wpbs-layout-grid-card__container wpbs-layout-wrapper relative z-20',
            })} />
            <BackgroundElement attributes={props.attributes} editor={false}/>
        </div>;


    }
})


