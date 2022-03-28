const { functionExpression } = require('@babel/types');
let {isOperator,isFunction, removeWhiteSpace, isCustomField,isInterestingOperator} = require('../lib/utils');

function parse(formula){

    console.log('what is passed',formula)

    let functions = new Set();
    let operators = new Set();
    let standardFields = new Set();
    let customFields = new Set();

    formula = removeWhiteSpace(formula);
    let chars = formula.split('');

    let currentWord = '';
    let insideString = false;

    chars.forEach((char,index,text) => {

        console.log('char being evaluated',char)

        if(char == `"`){
            insideString = !insideString;
            return;
        }

        if(!insideString){

            console.log('we are not inside a string');

            if(!isOperator(char)){
                console.log(char,'is not an operator so we add it to the current word')
                console.log('current word ',currentWord);
                currentWord += char;  
                console.log('after addition ',currentWord);
            }
            else{

                console.log(char, ' is an operator')
                
                if(isInterestingOperator(char)) operators.add(char)
                

                if(currentWord != '' && currentWord.length > 1 ){  

                    console.log('current word is long enough and we just found a char ',currentWord,char)
    
                    if(isFunction(currentWord)){
                        functions.add(currentWord);
                    }
                    else if(isCustomField(currentWord)){
                        customFields.add(currentWord)
                    }
                    else{
                        standardFields.add(currentWord);
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