let parseType = require('../lib/parseTypes');
let _ = require('../lib/utils');
let ValueType = require('../lib/ValueTypes');

function parse({object,formula}){

    let functions = new Set();
    let operators = new Set();
    let standardFields = new Set();
    let customFields = new Set();
    let customSettings = new Set();
    let customMetadataTypes = new Set();
    let customLabels = new Set();
    let types = [];

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

    types.forEach(t => {

        if(t.type == ValueType.CUSTOM_FIELD){
            customFields.add(t.instance);
        }

        else if(t.type == ValueType.STANDARD_FIELD){
            standardFields.add(t.instance);
        }

        else if(t.type == ValueType.CUSTOM_LABEL){
            customLabels.add(t.instance);
        }

        else if(t.type == ValueType.CUSTOM_METADATA_TYPE){
            customMetadataTypes.add(t.instance);
        }

        else if(t.type == ValueType.CUSTOM_SETTING){
            customSettings.add(t.instance);
        }

    })

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
        else{
            types.push(...parseType(value,object));
        }

        clearWord();
    }

    function clearWord(){
        currentWord = '';
    }

    return {
        functions,
        operators,
        standardFields,
        customFields,
        customLabels,
        customMetadataTypes,
        customSettings
    }

}

module.exports = parse;