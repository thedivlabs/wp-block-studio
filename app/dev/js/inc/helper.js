export default function Helper() {

    this.testing = () => {
        console.log('qqqqqq');
    }

}

export function updateSettings(attr, val, callback) {
    callback(val);

    return Object.assign({}, settings, {[attr]: val});
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