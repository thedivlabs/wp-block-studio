import apiFetch from '@wordpress/api-fetch';


export function LayoutStyle({attributes, clientId, blockProps}) {

    if (!clientId) {
        //return false;
    }

    console.log(clientId);

    const selector = '[data-block="' + clientId + '"] > style#wpbs-layout-styles';

    apiFetch({
        path: '/wpbs/v1/layout-styles/',
        method: 'POST',
        data: {
            attributes: attributes,
            selector: selector
        },
    }).then((response) => {
        const el = document.querySelector(selector);
        el.innerHTML = response;
    });

    return <style id={'wpbs-layout-styles'} style={{display: 'none'}}/>;
}
