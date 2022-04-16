let parseType = require('../lib/parseTypes');
let _ = require('../lib/utils');
let ValueType = require('../lib/ValueTypes');

function parse({object,formula}){

    let functions = new Set();
    let operators = new Set();
    let types = [];
    let allTypes = {};

    let chars = _.removeWhiteSpace(formula).split('');

    let currentWord = '';
    let insideString = false;
    let insideComment = false;

    chars.forEach((char,index,text) => {

        let isLastChar = (text.length-1 == index);

        if(char == '/' && !isLastChar && _.isCommentStart(char+text[index+1])){
            insideComment = true;
            return;
        }

        if(char == '*' && !isLastChar && _.isCommentEnd(char+text[index+1])){
            insideComment = false;
            return;
        }

        if(char == `"`){
            insideString = !insideString;
            return;
        }

        if(!insideString && !insideComment){

            if(!_.isOperator(char)){

                currentWord += char;  

                if(isLastChar){
                    determineType(currentWord);
                }
            }

            else if(_.isOperator(char)) {
                
                if(_.isInterestingOperator(char)) operators.add(char)
                
                if(currentWord != '' && currentWord.length > 1 ){  
                    determineType(currentWord);
                }
            }
        }  
        
        return;
    });

    allTypes = organizeInstancesByType(types);

    function determineType(value){

        if(_.isFunction(value)){

            functions.add(_.up(value));
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
        functions : Array.from(functions),
        operators : Array.from(operators),
        ...allTypes
    }

}

function organizeInstancesByType(types){

    let allTypes = {};

    types.forEach(t => {

        if(allTypes[t.type.name]) {
            allTypes[t.type.name].add(t.instance);
        }
        else { 
            allTypes[t.type.name] = new Set([t.instance]);
        }
    })

    let result = {}

    //transform sets to arrays 
    Object.keys(allTypes).map(key => {
        result[key] = Array.from(allTypes[key]);
    })

    return result;
}

module.exports = parse;