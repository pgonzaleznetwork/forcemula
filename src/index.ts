const parseType = require('../lib/parseTypes');
const _ = require('../lib/utils');
const check = require('../lib/parser/grammarChecks')
const MetadataType = require('../lib/MetadataTypes');
const transform = require('../lib/parser/transformations');

type ParseRequest = {
    parentObject:string,
    formula:string
}

function parse(request:ParseRequest){

    const {parentObject,formula} = request;

    if(!parentObject || !formula) throw "MISSING_PARAMETER"

    const functions = new Set<string>;
    const operators = new Set<string>;
    const types = [];
    let allTypes = {};

    const chars: string[] = _.removeWhiteSpace(formula).split('');

    let currentWord = '';
    let insideString = false;
    let insideComment = false;

    chars.forEach((char: string ,index: number,originalChars: string[]) => {

        let isLastChar: boolean = (originalChars.length-1 == index);

        if(char == '/' && !isLastChar && check.isCommentStart(char+originalChars[index+1])){
            insideComment = true;
            return;
        }

        if(char == '*' && !isLastChar && check.isCommentEnd(char+originalChars[index+1])){
            insideComment = false;
            return;
        }

        if(char == `"`){
            insideString = !insideString;
            return;
        }

        if(!insideString && !insideComment){

            if(!check.isOperator(char)){

                currentWord += char;  

                if(isLastChar){
                    determineType(currentWord);
                }
            }

            else if(check.isOperator(char)) {
                
                if(check.isInterestingOperator(char)) operators.add(char)
                
                if(currentWord != '' && currentWord.length > 1 ){  
                    determineType(currentWord);
                }
            }
        }  
        
        return;
    });

    allTypes = organizeInstancesByType(types);

    function determineType(token: string){

        const upperToken = token.toUpperCase();

        if(check.isNumber(upperToken)){

            clearWord();
            return;
        }

        else if(check.isFunction(upperToken)){

            functions.add(upperToken)
            clearWord();
            return;
        }

        
        else{

            types.push(...parseType(token,parentObject));
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