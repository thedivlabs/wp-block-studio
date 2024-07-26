import React, {useState} from "react"

const Helper = function Helper() {


}

export function parseProp(prop) {

    if(!prop){
        return '';
    }

    if (prop === '0') {
        return '0';
    }

    prop = typeof prop === 'string' ? prop : '';

    return [
        'var(--wp--',
        prop.replace('var:', '').replaceAll('|', '--'),
        ')'
    ].join('');

}

export default Helper