const G = require('../parser/grammar');
const _ = require('../utils');

let isCommentStart = value => value == G.COMMENT_START;
let isCommentEnd = value => value ==  G.COMMENT_END;

let isNothing = value => (value == null || value == undefined || value == '');

let isNumber = value => !isNaN(value);

let isInterestingOperator = operator => ![',','(',')'].includes(operator);

let isStandardRelationship = value => !_.$(value).endsWith(G.RELATIONSHIP_SUFFIX);

let isRelationshipField = value => value.includes('.');

let isCustom = value => _.$(value).endsWith(G.CUSTOM_ENTITY_SUFFIX);

let isUserField = value => G.USER_FIELDS.includes(_.$(_.getObject(value)));

let isCustomMetadata = value => _.$(value).includes(G.CUSTOM_METADATA_PREFIX);

let isCustomLabel = value => _.$(value).startsWith(G.CUSTOM_LABEL_PREFIX);

let isCustomSetting = value => _.$(value).startsWith(G.CUSTOM_SETTING_PREFIX);

let isObjectType = value => _.$(value).startsWith(G.OBJECT_TYPE_PREFIX);

let isSpecialPrefix = value => G.SPECIAL_PREFIXES.includes(_.$(value));

let isParentField = value => _.$(_.getField(value)) == G.SELF_REFERENTIAL_PARENT_FIELD;

let isParent = value => _.$(value) == G.SELF_REFERENTIAL_PARENT_OBJECT;

let isProcessBuilderPrefix = value => {
    return value.startsWith(G.PROCESS_BUILDER_BRACKET_START) && value.endsWith(G.PROCESS_BUILDER_BRACKET_END);
}

let isCPQRelationship = value => {
    return _.$(_.getObject(value)).startsWith(G.CPQ_NAMESPACE) && _.$(_.getObject(value)).endsWith(G.RELATIONSHIP_SUFFIX);
}

let isOperator = char => {

    if(isNothing(char)) return false;
    return G.OPERATORS.includes(char.trim());
}

let isFunction = value => {
    
    if(isNothing(value)) return false;
    
    return G.FUNCTIONS.includes(_.$(value.trim()));
};

module.exports = {isFunction,isOperator,
    isCustom,isInterestingOperator,isNothing,isNumber,
    isStandardRelationship,isParent,isCPQRelationship,isParentField,isProcessBuilderPrefix,
isUserField,isCustomMetadata,isCustomLabel,isObjectType,isCommentStart,isCommentEnd,
isCustomSetting,isRelationshipField,isSpecialPrefix}