let parseField = require('../lib/parseFields');
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
            }
        }  
        
        return;
    });


    function determineType(value){

        if(_.isFunction(value)){

            functions.add(value);
            clearWord();
            return;
        }

        else if(_.isNumber(value)){

            clearWord();
            return;
        }

        //if we get here, we know it's a field  
        value = `${object}.${value}`;
        
        Array.from(parseField(value)).forEach(field => {

            if(_.isCustomField(field)){
                customFields.add(field)
            }
            else{
                standardFields.add(field);
            }
        })

        clearWord();
    }

    function clearWord(){
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