var OFF = 0, WARN = 1, ERROR = 2;

module.exports = exports = {
    "env": {
        "node": true,
        "browser": true,
        "mocha": true,
        "jquery": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-unused-vars": [ ERROR, { "args": "all", "argsIgnorePattern": "^_" } ],
        "no-unexpected-multiline": ERROR,
        "valid-jsdoc": [ ERROR, {
            "requireReturn": false,
            "requireReturnDescription": false,
            "requireParamDescription": true,
            "prefer": {
                "return": "returns"
            }
        }],
        "no-warning-comments": [ WARN, {
            "terms": [ "TODO", "FIXME" ],
            "location": "start"
        }],
        // Whitespace
        "indent": [ERROR, 4, { "SwitchCase": 1 }],
        "no-trailing-spaces": ERROR,
        "space-before-blocks": ERROR,
        "keyword-spacing": ERROR,
        "semi-spacing": ERROR,
        "comma-spacing": ERROR,
        "space-infix-ops": ERROR,
        "space-in-parens": ERROR,
        "space-before-function-paren": [ERROR, "never"],
        "array-bracket-spacing": ERROR,
        "space-before-function-paren": [ERROR, "never"],

        // Low Risk
        "curly": ERROR,
        "brace-style": [ERROR, "stroustrup"],
        "semi": ERROR,
        "comma-style": ERROR,
        "comma-dangle": ERROR,
        "max-statements-per-line": ERROR,
        "quotes": ["error", "single", { "avoidEscape": true }],

        // Medium Risk
        "eqeqeq": ERROR,
        "no-nested-ternary": ERROR,
        "no-new-object": ERROR,
        "no-eval": ERROR,
        "no-extend-native": ERROR,
        "no-implicit-coercion": [ERROR, { "allow": ["!!"] } ],
        "no-extra-boolean-cast": ERROR,

        // Renaming
        "camelcase": ERROR,
        "new-cap": ERROR,
        "func-names": OFF,
        "no-useless-rename": ERROR,

        // High Risk
        "strict": ERROR,
        "no-loop-func": ERROR,
        "max-len": [ERROR, 120],
        "max-lines": [ERROR, {"max": 600, "skipBlankLines": true, "skipComments": true}],
        "max-params": [ERROR, 6],
        "max-statements": [ERROR, 35],
        "max-depth": [ERROR, 5]
    }
};
