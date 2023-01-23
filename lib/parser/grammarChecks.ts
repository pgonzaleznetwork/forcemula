const G = require('../parser/grammar');
const {$,getField,getObject,parts} = require('../utils');

/**
 * TODO
 * 
 * Maybe I should divide the functions in files for strings and numbers, or maybe do the check
 * much earlier
 * This way I don't need to put a typeguard in every single function
 * the caller should check if it's a number, then do whatever, if it's a string, check for the grammar
 */

type checkFunction = (token:string|number) => boolean

let isCommentStart:checkFunction = token => token == G.COMMENT_START;
let isCommentEnd:checkFunction = token => token ==  G.COMMENT_END;

let isNothing:checkFunction = token => (token == null || token == undefined || token == '');

let isNumber:checkFunction = token => {
    return (typeof token == "number")
}

let isInterestingOperator:checkFunction = (operator) => {

    if(typeof operator == "string"){
        return ![',','(',')'].includes(operator)
    }
    return false;
    
};

let isStandardRelationship:checkFunction = token => !$(token).endsWith(G.RELATIONSHIP_SUFFIX);

let isRelationshipField:checkFunction = token => token.includes('.');

let isCustom = token => $(token).endsWith(G.CUSTOM_ENTITY_SUFFIX);

let isUserField = token => G.USER_FIELDS.includes($(getObject(token)));

let isCustomMetadata = token => $(token).includes(G.CUSTOM_METADATA_PREFIX);

let isCustomLabel:checkFunction = token => $(token).startsWith(G.CUSTOM_LABEL_PREFIX);

let isCustomSetting = token => $(token).startsWith(G.CUSTOM_SETTING_PREFIX);

let isObjectType = token => $(token).startsWith(G.OBJECT_TYPE_PREFIX);

let isSpecialPrefix = token => G.SPECIAL_PREFIXES.includes($(token));

let isParentField = token => $(getField(token)) == G.SELF_REFERENTIAL_PARENT_FIELD;

let isParent = token => $(token) == G.SELF_REFERENTIAL_PARENT_OBJECT;

let isProcessBuilderPrefix = token => {
    return token.startsWith(G.PROCESS_BUILDER_BRACKET_START) && token.endsWith(G.PROCESS_BUILDER_BRACKET_END);
}

let isCPQRelationship = token => {

    let obj =  $(getObject(token));

    return obj.startsWith(G.CPQ_NAMESPACE) && obj.endsWith(G.RELATIONSHIP_SUFFIX);
}

let isOperator = char => {

    if(isNothing(char)) return false;
    return G.OPERATORS.includes(char.trim());
}

let isFunction = token => {
    
    if(isNothing(token)) return false;
    
    return G.FUNCTIONS.includes($(token.trim()));
};

module.exports = {isFunction,isOperator,
    isCustom,isInterestingOperator,isNothing,isNumber,
    isStandardRelationship,isParent,isCPQRelationship,isParentField,isProcessBuilderPrefix,
isUserField,isCustomMetadata,isCustomLabel,isObjectType,isCommentStart,isCommentEnd,
isCustomSetting,isRelationshipField,isSpecialPrefix}