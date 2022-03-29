const { functionExpression } = require('@babel/types');
let _ = require('../lib/utils');

function parse({object,formula}){

    let functions = new Set();
    let operators = new Set();
    let standardFields = new Set();
    let customFields = new Set();

    let chars = _.removeWhiteSpace(formula).split('');

    let currentWord = '';
    let insideString = false;

    chars.forEach((char,index,text) => {

        if(char == `"`){
            insideString = !insideString;
            return;
        }

        if(!insideString){

            if(!_.isOperator(char)){

                currentWord += char;  

                //last character
                if( (text.length-1) == index ){
                    determineType(currentWord);
                }   
            }
            else{
                
                if(_.isInterestingOperator(char)) operators.add(char)
                
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

        if(!_.isNothing(object)){
            fieldSyntax = `${object}.${value}`;
        }

        if(_.isFunction(value)){
            functions.add(value);
        }
        else if(_.isCustomField(value)){
            customFields.add(fieldSyntax)
        }
        else if(_.isNumber(value)){
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