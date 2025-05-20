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
import {PanelBody, TabPanel} from "@wordpress/components";


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
    edit: (props) => {


        const {attributes, setAttributes} = props;

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-layout-grid-card');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        useEffect(() => {
            console.log(attributes);
        }, [attributes]);

        const blockProps = useBlockProps({
            className: sectionClassNames(attributes),
        });


        return (
            <>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <BackgroundControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes}
                       uniqueId={uniqueId}
                       css={[backgroundCss(attributes), layoutCss(attributes)]}
                       deps={['wpbs-background','wpbs-layout']}
                />

                <div {...blockProps}>
                    <div {...useInnerBlocksProps({
                        className: 'wpbs-layout-grid-card__container wpbs-layout-wrapper relative z-20',
                    })} />
                    <BackgroundElement attributes={attributes} editor={true}/>
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


