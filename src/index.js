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

            if(isOperator(char)){

                console.log('is an operator',char)

                if(currentWord != '' && currentWord.length > 1 ){

                    console.log('current word is mor than 1 char',currentWord);

                    operators.push(char);
    
                    if(isFunction(currentWord)){
                        console.log('current word is a function',currentWord);
                        functions.push(currentWord);
                    }
                    else if(isCustomField(currentWord)){
                        console.log('current word is a custom field',currentWord);
                        customFields.push(currentWord)
                    }
                    else{
                        console.log('current word is considered a standard field',currentWord);
                        standardFields.push(currentWord);
                    }
    
                    console.log('now we clear the current word')
                    currentWord = '';
                }
                else{
                    console.log('current word is not more than one char, so we move on')
                    return;
                }

            }
            else{
                console.log('is NOT an operator',char)
                console.log('adding ',char);
                console.log('to',currentWord);
                currentWord += char;
                console.log('it became ',currentWord);
                
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