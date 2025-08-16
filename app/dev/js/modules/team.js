export default class Team {


    static init() {

        [...document.querySelectorAll('.team-profile-toggle')].forEach(el => {
            el.addEventListener('click', (e) => {
                fetch('/wp-admin/admin-ajax.php?action=team_profile&postId=6467')
                    .then(res => res.json())
                    .then(response => {
                        const {data} = response;

                        Object.values(data?.styles ?? {}).forEach(url => {
                            if (!url) return;
                            const link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.href = url;
                            document.head.appendChild(link);
                        });

                        // 2. Inject inline CSS
                        if (data.inline_css.length) {
                            const style = document.createElement('style');
                            style.innerHTML = data.inline_css.join("\n");
                            document.head.appendChild(style);
                        }

                        // 3. Parse HTML string into DOM nodes
                        const template = document.createElement('div');
                        template.innerHTML = data.rendered;

                        // 4. Extract the template part element
                        const element = template.querySelector('.wpbs-team-member-profile');
                        if (!element) return;

                        // 5. Append to the body (or any container)
                        document.body.appendChild(element);
                    });
            }, {
                passive: true,
            })
        })


    }


}