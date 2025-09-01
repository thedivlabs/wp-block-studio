export default class Reveal {

    static init() {
        // Check if any elements need AOS
        if (!document.querySelector('[data-aos]')) {
            return false;
        }
        wp.domReady(() => {

            // Inject AOS CSS
            const link = document.createElement('link');
            link.href = 'https://cdn.jsdelivr.net/npm/aos/dist/aos.min.css';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            document.head.appendChild(link);

            // Load AOS JS dynamically
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/aos/dist/aos.min.js';
            script.onload = () => {
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        disable: function () {
                            const maxWidth = parseInt(WPBS?.settings?.breakpoints?.normal ?? '768');
                            return window.innerWidth < maxWidth;
                        }
                    });
                }
            };
            document.body.appendChild(script);
        })

    }
}
