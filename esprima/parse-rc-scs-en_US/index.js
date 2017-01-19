const esprima = require('esprima');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

function readFile(filePath, fallbackValue) {
    'use strict';
    filePath = path.normalize(filePath);

    return new Promise(function (fulfill, reject){
        fs.readFile(filePath, function (err, data) {
            if (err) {
                if (fallbackValue !== undefined) {
                    fulfill(fallbackValue);
                } else {
                    reject(err);
                }
            } else {
                fulfill(data);
            }
        });
    });
};

readFile('./en_US.js').then((data) => {
    let code = data.toString('utf-8');
    let parsedCode = esprima.parse(code);
    console.log(parsedCode);

    var body = parsedCode.body;
    _.each(body, (expressionStatement) => {
        let args = expressionStatement.expression.arguments;

        if (args.length == 1) {
            return;
        }

        let arg = args[0];
        let object = arg;
        let parts = [];

        while (object) {
            let type = object.type;

            if (type == 'Identifier') {
                parts.unshift(object.name);
            } else if (type == 'MemberExpression') {
                parts.unshift(object.property.name);
            }
            
            object = object.object;
        }

        console.log('arguments[0] name: ', parts.join('.'));
    });

});