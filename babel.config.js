/* SPDX-FileCopyrightText: 2014-present Kriasoft <hello@kriasoft.com> */
/* SPDX-License-Identifier: MIT */

/**
 * Babel configuration.
 *
 * @see https://babeljs.io/docs/en/options
 * @param {import("@babel/core").ConfigAPI} api
 * @returns {import("@babel/core").TransformOptions}
 */
module.exports = function config(api) {
    return {
        presets: ['@babel/preset-env'],

        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-object-rest-spread',
        ],

        overrides: [
            {
                test: /\.(tsx|ts)?$/,
                presets: ['@babel/preset-typescript'],
            },
            {
                test: /\.(tsx|jsx|js|ts)$/,
                presets: [
                    [
                        '@babel/preset-react',
                        {
                            development: api.env() === 'development',
                            useBuiltIns: true,
                            runtime: 'automatic',
                        },
                    ],
                    ['@babel/preset-env'],
                ],
            },
        ],
    };
};
