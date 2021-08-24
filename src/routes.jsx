export const routes = [
    {
        id: 'inventory-home',
        path: '/inventory',
        exact: true,
        name: 'Inventory',
        icon: '',
        main: <h1>Inventory</h1>,
    },
    {
        id: 'repairs-home',
        path: '/repairs',
        name: 'Repairs',
        exact: false,
        icon: '',
        main: <h1>Repairs</h1>,
    },
    {
        id: 'case-home',
        path: '/case',
        name: 'Cases',
        icon: '',
        main: () => <h2>This is the Cases Page</h2>,
    },
];

export const loadNavRoutes = (loader) => {
    routes.forEach((route) => {
        loader(route);
    });
};
