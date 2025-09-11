import {useEffect} from 'react';
import {select, useSelect} from '@wordpress/data';


export const imageButtonStyle = {
    border: '1px dashed lightgray',
    width: '100%',
    height: 'auto',
    aspectRatio: '16/9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
}

export function cleanObject(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(cleanObject)
            .filter(v => v != null && v !== '' && !(typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length));
    }

    if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, cleanObject(v)])
                .filter(([_, v]) =>
                    v != null &&
                    v !== '' &&
                    !(Array.isArray(v) && v.length === 0) &&
                    !(typeof v === 'object' && Object.keys(v).length === 0)
                )
        );
    }

    return obj;
}


function getAllBlocks(blocks) {
    return blocks.reduce((all, block) => {
        all.push(block);
        if (block.innerBlocks.length) {
            all.push(...getAllBlocks(block.innerBlocks));
        }
        return all;
    }, []);
}


export function useUniqueId(attributes, setAttributes, clientId, prefix = 'block') {
    useEffect(() => {
        const hasId = !!attributes.uniqueId;

        const allTopBlocks = select('core/block-editor').getBlocks();
        const allBlocks = getAllBlocks(allTopBlocks);

        const isDuplicate = allBlocks.some((block) => {

            return block.clientId !== clientId && block.attributes?.uniqueId === attributes.uniqueId;
        });

        if (!hasId || isDuplicate) {
            const newId = `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
            setAttributes({uniqueId: newId});
        }
    }, [attributes.uniqueId, setAttributes, clientId, prefix]);

    return attributes.uniqueId;
}


export function googleMaterialSymbols(){

    async function loadFont() {
        // Define the weights you want
        const weights = WPBS?.settings?.icons ?? [200, 300, 500];

        // Loop through each weight and load
        /*for (const weight of weights) {
            // Adjust your file naming convention as needed
            const path = `${WPBS?.settings?.path?.theme}/assets/fonts/material-symbols-outlined-v276-latin-${weight}.woff2`;

            const font = new FontFace("Material Symbols Outlined", `url(${path})`, {
                weight: weight.toString(),
                style: "normal",
                display: "swap",
            });

            try {
                const loadedFont = await font.load();
                document.fonts.add(loadedFont);
            } catch (err) {
                console.error(`Font ${weight} failed to load`, err);
            }
        }*/

        const path = `${WPBS?.settings?.path?.theme}/assets/fonts/material-symbols-outlined-full.woff2`;

        const font = new FontFace("Material Symbols Outlined", `url(${path})`, {
            style: "normal",
            display: "swap",
        });

        try {
            const loadedFont = await font.load();
            document.fonts.add(loadedFont);
        } catch (err) {
            console.error(`Font failed to load`, err);
        }
    }

    loadFont().then(() => {
        if (document.fonts && document.fonts.load) {
            // Wait until the Material Symbols Outlined font is fully loaded
            document.fonts.load('1em "Material Symbols Outlined"').then(() => {
                // Add a class to the body to indicate the font is ready

                document.body.classList.add('icons-loaded');


            }).catch(() => {
                // Fallback: in case of error, still add the class
                //document.body.classList.add('material-icons-loaded');
            });
        } else {
            // Fallback for older browsers that don't support the Font Loading API
            //document.body.classList.add('material-icons-loaded');
        }
    });



}