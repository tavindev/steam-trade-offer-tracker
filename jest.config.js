/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
    },
    modulePathIgnorePatterns: ["__tests__/utils"],
};
