const { functionExpression } = require('@babel/types');
let {isOperator,isFunction, removeWhiteSpace, isCustomField} = require('../lib/utils');

function parse(formula){

    let functions = [];
    let operators = [];
    let standardFields = [];
    let customFields = [];

    formula = removeWhiteSpace(formula);
    let chars = formula.split('');

    let currentWord = '';
    let insideString = false;

    chars.forEach((char,index,text) => {

        if(char == `"`){
            insideString = !insideString;
        }

        if(!insideString){

            if(!isOperator(char)){
                currentWord += char;  
            }
            else{
                
                operators.push(char);

                if(currentWord != '' && currentWord.length > 1 ){  
    
                    if(isFunction(currentWord)){
                        functions.push(currentWord);
                    }
                    else if(isCustomField(currentWord)){
                        customFields.push(currentWord)
                    }
                    else{
                        standardFields.push(currentWord);
                    }
    
                    currentWord = '';
                }
                else{
                    return;
                }
            }
        }  
        else{
            return;
        }

    });

    return {
        functions,
        operators,
        standardFields,
        customFields
    }

}

module.exports = parse;