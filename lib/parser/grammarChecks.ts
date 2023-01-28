const grammar = require('../parser/grammar');
const {upper,getField,getObject,parts} = require('../utils');

type GrammarPredicate = (token:string) => boolean;

const isCommentStart: GrammarPredicate = token => token == grammar.COMMENT_START;
const isCommentEnd: GrammarPredicate = token => token ==  grammar.COMMENT_END;

const isNothing: GrammarPredicate = token => (token == null || token == undefined || token == '');

const isNumber: GrammarPredicate = (token:string) => !isNaN(Number(token));

const isInterestingOperator: GrammarPredicate = operator => ![',','(',')'].includes(operator);

const isStandardRelationship: GrammarPredicate = token => !upper(token).endsWith(grammar.RELATIONSHIP_SUFFIX);

const isRelationshipField: GrammarPredicate = token => token.includes('.');

const isCustom: GrammarPredicate = token => upper(token).endsWith(grammar.CUSTOM_ENTITY_SUFFIX);

const isUserField: GrammarPredicate = token => grammar.USER_FIELDS.includes(upper(getObject(token)));

const isCustomMetadata: GrammarPredicate = token => upper(token).includes(grammar.CUSTOM_METADATA_PREFIX);

const isCustomLabel: GrammarPredicate = token => upper(token).startsWith(grammar.CUSTOM_LABEL_PREFIX);

const isCustomSetting: GrammarPredicate = token => upper(token).startsWith(grammar.CUSTOM_SETTING_PREFIX);

const isObjectType: GrammarPredicate = token => upper(token).startsWith(grammar.OBJECT_TYPE_PREFIX);

const isSpecialPrefix: GrammarPredicate = token => grammar.SPECIAL_PREFIXES.includes(upper(token));

const isParentField: GrammarPredicate = token => upper(getField(token)) == grammar.SELF_REFERENTIAL_PARENT_FIELD;

const isParent: GrammarPredicate = token => upper(token) == grammar.SELF_REFERENTIAL_PARENT_OBJECT;

const isProcessBuilderPrefix: GrammarPredicate = token => {
    return token.startsWith(grammar.PROCESS_BUILDER_BRACKET_START) && token.endsWith(grammar.PROCESS_BUILDER_BRACKET_END);
}

const isCPQRelationship: GrammarPredicate = token => {

    const obj =  upper(getObject(token));

    return obj.startsWith(grammar.CPQ_NAMESPACE) && obj.endsWith(grammar.RELATIONSHIP_SUFFIX);
}

const isOperator: GrammarPredicate = char => {

    if(isNothing(char)) return false;
    return grammar.OPERATORS.includes(char.trim());
}

const isFunction: GrammarPredicate = token => {
    
    if(isNothing(token)) return false;
    
    return grammar.FUNCTIONS.includes(upper(token.trim()));
};

module.exports = {isFunction,isOperator,
    isCustom,isInterestingOperator,isNothing,isNumber,
    isStandardRelationship,isParent,isCPQRelationship,isParentField,isProcessBuilderPrefix,
isUserField,isCustomMetadata,isCustomLabel,isObjectType,isCommentStart,isCommentEnd,
isCustomSetting,isRelationshipField,isSpecialPrefix}