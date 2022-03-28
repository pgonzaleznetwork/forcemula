const { functionExpression } = require('@babel/types');
let {isOperator,isFunction, removeWhiteSpace, isNothing,isCustomField,isInterestingOperator,isNumber} = require('../lib/utils');

function parse({object,formula}){

    let functions = new Set();
    let operators = new Set();
    let standardFields = new Set();
    let customFields = new Set();

    let chars = removeWhiteSpace(formula).split('');

    let currentWord = '';
    let insideString = false;

    chars.forEach((char,index,text) => {

        if(char == `"`){
            insideString = !insideString;
            return;
        }

        if(!insideString){

            if(!isOperator(char)){

                currentWord += char;  

                //last character
                if( (text.length-1) == index ){
                    determineType(currentWord);
                }   
            }
            else{
                
                if(isInterestingOperator(char)) operators.add(char)
                
                if(currentWord != '' && currentWord.length > 1 ){  
                    determineType(currentWord);
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


    function determineType(value){

        let fieldSyntax = value;

        if(!isNothing(object)){
            fieldSyntax = `${object}.${value}`;
        }

        if(isFunction(value)){
            functions.add(value);
        }
        else if(isCustomField(value)){
            customFields.add(fieldSyntax)
        }
        else if(isNumber(value)){
            //do nothing;
        }
        else{
            standardFields.add(fieldSyntax);
        }

        currentWord = '';
    }

    return {
        functions,
        operators,
        standardFields,
        customFields
    }

}

module.exports = parse;