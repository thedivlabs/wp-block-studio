export function parseProp(prop) {

    if (prop === '0' || !prop) {
        return '0';
    }

    prop = typeof prop === 'string' ? prop : false;

    if (!prop) {
        return false
    }

    return [
        'var(--wp--',
        prop.replace('var:', '').replaceAll('|', '--'),
        ')'
    ].join('');

}

export function breakpoint(prop) {
    
}