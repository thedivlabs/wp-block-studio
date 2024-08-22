const Helper = function Helper() {


}

export function parseProp(prop) {

    if (prop === '0' || !prop) {
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