var component = require('./component');

let demoComponent = component.default();

document.body.appendChild(demoComponent);

if (module.hot) {
    module.hot.accept('./component', () => {
        const nextComponent = require('./component').default();

        document.body.replaceChild(nextComponent, demoComponent);
        demoComponent = nextComponent;
    });
}