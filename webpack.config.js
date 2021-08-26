const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const InlineChunkHtmlPlugin = require('inline-chunk-html-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { EnvironmentPlugin } = require('webpack');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const {
    name: appName,
    dependencies: deps,
    moduleExports: exposes,
} = require('./package.json');
const dotenv = require('dotenv');

module.exports = (_, options) => {
    const isEnvProduction = options.mode === 'production';
    const isEnvDevelopment = options.mode === 'development';
    const isDevServer = isEnvDevelopment && process.argv.includes('serve');
    const isEnvProductionProfile =
        isEnvProduction && process.argv.includes('--profile');

    if (isEnvDevelopment) {
        if (fs.existsSync(path.resolve(__dirname, '.env'))) {
            dotenv.config({ path: '.env' });
        } else {
            dotenv.config({ path: '.env.defaults' });
        }
    }
    process.env.NODE_ENV = options.mode;
    process.env.BABEL_ENV = options.mode;
    process.env.BROWSERSLIST_ENV = options.mode;

    const appConfig = {
        name: appName,
        mode: isEnvProduction ? 'production' : 'development',
        target: isDevServer ? 'web' : 'browserslist',
        bail: isEnvProduction,
        entry: path.resolve(__dirname, 'src/index.js'),
        output: {
            clean: true,
            path: path.resolve(__dirname, 'build'),
            pathinfo: isEnvDevelopment,
            filename: isEnvProduction
                ? 'js/[name].[contenthash:8].js'
                : 'js/[name].js',
            chunkFilename: isEnvProduction
                ? 'js/[name].[contenthash:8].js'
                : 'js/[name].js',
            publicPath: '',
        },
        stats: {
            assets: isEnvProduction,
            entrypoints: isEnvProduction,
            modules: isEnvProduction,
            env: true,
            providedExports: true,
        },
        resolve: {
            extensions: [
                '.wasm',
                '.mjs',
                '.js',
                '.ts',
                '.d.ts',
                '.tsx',
                '.jsx',
                '.json',
            ],
            alias: {
                ...(isEnvProductionProfile && {
                    'react-dom$': 'react-dom/profiling',
                    'scheduler/tracing': 'scheduler/tracing-profiling',
                }),
                core: path.join(__dirname, 'core'),
            },
        },
        devtool: 'source-map',

        optimization: {
            minimize: isEnvProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        parse: { ecma: 8 },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2,
                        },
                        mangle: { safari10: true },
                        keep_classnames: isEnvProductionProfile,
                        keep_fnames: isEnvProductionProfile,
                        output: { ecma: 5, comments: false, ascii_only: true },
                    },
                }),
            ],

            runtimeChunk: {
                name: (entrypoint) => `runtime-${entrypoint.name}`,
            },
        },
        performance: {
            maxAssetSize: 650 * 1024,
            maxEntrypointSize: 650 * 1024,
        },
        module: {
            rules: [
                {
                    test: /\.m?js/,
                    type: 'javascript/auto',
                    resolve: {
                        fullySpecified: false,
                    },
                },
                {
                    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                    type: 'asset/resource',
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(ts|tsx|js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-typescript',
                                '@babel/preset-react',
                                '@babel/preset-env',
                            ],
                            plugins: ['@babel/transform-runtime'],
                        },
                    },
                },
            ],
        },

        plugins: [
            new ModuleFederationPlugin({
                name: appName,
                filename: 'remoteEntry.js',
                library: { type: 'var', name: appName },
                remotes: {},
                exposes: {
                    ...exposes,
                },
                shared: {
                    ...deps,
                    react: {
                        singleton: true,
                        requiredVersion: deps.react,
                    },
                    'react-dom': {
                        singleton: true,
                        requiredVersion: deps['react-dom'],
                    },
                },
            }),
            new HtmlWebpackPlugin({
                inject: true,
                template: path.resolve(__dirname, 'public/index.html'),
                ...(isEnvProduction && {
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        keepClosingSlash: true,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyURLs: true,
                    },
                }),
            }),
            isEnvProduction &&
                new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [
                    /runtime-.+[.]js/,
                ]),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new WebpackManifestPlugin({
                fileName: 'assets.json',
                publicPath: '/',
            }),
            new EnvironmentPlugin({
                ...process.env,
            }),
        ].filter(Boolean),
    };

    /**
     * Development server that provides live reloading.
     *
     * @see https://webpack.js.org/configuration/dev-server/
     * @type {import("webpack-dev-server").Configuration}
     */
    const devServer = {
        compress: true,
        historyApiFallback: { disableDotRule: true },
        port: process.env.PORT || 3000,
        hot: true,
        open: process.env.BROWSER !== 'none',
    };
    return isDevServer ? { ...appConfig, devServer } : [appConfig];
};
