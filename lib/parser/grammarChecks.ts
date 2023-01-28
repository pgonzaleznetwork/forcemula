const grammar = require('../parser/grammar');
const {upper,getField,getObject,parts} = require('../utils');

type GrammarPredicate = (token:string) => boolean;

let isCommentStart: GrammarPredicate = token => token == grammar.COMMENT_START;
let isCommentEnd: GrammarPredicate = token => token ==  grammar.COMMENT_END;

let isNothing: GrammarPredicate = token => (token == null || token == undefined || token == '');

let isNumber: GrammarPredicate = (token:string) => !isNaN(Number(token));

let isInterestingOperator: GrammarPredicate = operator => ![',','(',')'].includes(operator);

let isStandardRelationship: GrammarPredicate = token => !upper(token).endsWith(grammar.RELATIONSHIP_SUFFIX);

let isRelationshipField: GrammarPredicate = token => token.includes('.');

let isCustom: GrammarPredicate = token => upper(token).endsWith(grammar.CUSTOM_ENTITY_SUFFIX);

let isUserField: GrammarPredicate = token => grammar.USER_FIELDS.includes(upper(getObject(token)));

let isCustomMetadata: GrammarPredicate = token => upper(token).includes(grammar.CUSTOM_METADATA_PREFIX);

let isCustomLabel: GrammarPredicate = token => upper(token).startsWith(grammar.CUSTOM_LABEL_PREFIX);

let isCustomSetting: GrammarPredicate = token => upper(token).startsWith(grammar.CUSTOM_SETTING_PREFIX);

let isObjectType: GrammarPredicate = token => upper(token).startsWith(grammar.OBJECT_TYPE_PREFIX);

let isSpecialPrefix: GrammarPredicate = token => grammar.SPECIAL_PREFIXES.includes(upper(token));

let isParentField: GrammarPredicate = token => upper(getField(token)) == grammar.SELF_REFERENTIAL_PARENT_FIELD;

let isParent: GrammarPredicate = token => upper(token) == grammar.SELF_REFERENTIAL_PARENT_OBJECT;

let isProcessBuilderPrefix: GrammarPredicate = token => {
    return token.startsWith(grammar.PROCESS_BUILDER_BRACKET_START) && token.endsWith(grammar.PROCESS_BUILDER_BRACKET_END);
}

let isCPQRelationship: GrammarPredicate = token => {

    let obj =  upper(getObject(token));

    return obj.startsWith(grammar.CPQ_NAMESPACE) && obj.endsWith(grammar.RELATIONSHIP_SUFFIX);
}

let isOperator: GrammarPredicate = char => {

    if(isNothing(char)) return false;
    return grammar.OPERATORS.includes(char.trim());
}

let isFunction: GrammarPredicate = token => {
    
    if(isNothing(token)) return false;
    
    return grammar.FUNCTIONS.includes(upper(token.trim()));
};

module.exports = {isFunction,isOperator,
    isCustom,isInterestingOperator,isNothing,isNumber,
    isStandardRelationship,isParent,isCPQRelationship,isParentField,isProcessBuilderPrefix,
isUserField,isCustomMetadata,isCustomLabel,isObjectType,isCommentStart,isCommentEnd,
isCustomSetting,isRelationshipField,isSpecialPrefix}