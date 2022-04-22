const G = require('../parser/grammar');
const cpqMapping = require('../mappings/cpq')
const _ = require('../utils');
const ValueType = require('../ValueTypes');
const {isCustom,isCustomMetadata,isStandardRelationship} = require('../parser/grammarChecks');

let transformToId = value => value+=G.STANDARD_RELATIONSHIP_ID_NAME;

let transformToUserField = value => `User.${_.getField(value)}`;

let replaceRwithC = value => value.slice(0,-1).concat('c');

let createApiName = (object,field) => `${object}.${field}`;

let parseCustomMetadata = value => {

    //$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c
    let [mdType,sobject,sobjInstance,fieldName] = _.parts(value);

    return [
        {
            instance: createApiName(sobject,sobjInstance),
            type: ValueType.CUSTOM_METADATA_TYPE_RECORD
        },
        {
            instance : sobject,
            type: ValueType.CUSTOM_METADATA_TYPE
        },
        parseField(fieldName,sobject) 
    ]
}

let parseCustomLabel = value => {

    return {
        type:ValueType.CUSTOM_LABEL,
        instance: _.getField(value)
    }
}

let parseCustomSetting = value => {

    let [prefix,object,field] = _.parts(value);

    return [
        {
            type:ValueType.CUSTOM_SETTING,
            instance:object
        },
        parseField(field,object) 
    ]
}

let parseObjectType = value => {

    //$ObjectType.Center__c.Fields.My_text_field__c
    let [mdType,sobject,prop,fieldName] = _.parts(value);

    return [
        parseField(fieldName,sobject),
        parseObject(sobject)
    ]
        
}

let parseField = (value,object) => {

    if(!value.includes('.')){
        value =  createApiName(object,value);
    }

    return {
        type: (isCustom(value) ? ValueType.CUSTOM_FIELD : ValueType.STANDARD_FIELD ),
        instance: value
    }
    
}

let parseObject = (object) => {

    let type = ValueType.STANDARD_OBJECT;

    if(isCustom(object)){
        type = ValueType.CUSTOM_OBJECT
    }
    else if(isCustomMetadata(object)){
        type = ValueType.CUSTOM_METADATA_TYPE;
    }
    else if(!isStandardRelationship(object)){
        type = ValueType.UNKNOWN_RELATIONSHIP;
    }

    return {
        type,
        instance: object
    }
    
}

let removePrefix = value =>  value.startsWith(G.DOLLAR_SIGN) ? value.substring(1) : value

let removeFirstAndLastChars = value => value.slice(1).slice(0,-1)

let mapCPQField = (value,originalObject) => {

    let [relationshipName,field] = _.parts(value);

    let apiName = cpqMapping[_.$(originalObject)]?.[_.$(relationshipName)];

    return createApiName(apiName ? apiName : relationshipName,field)

}

module.exports = {
    transformToId,replaceRwithC,parseCustomMetadata,
    parseCustomLabel,parseCustomSetting,parseObjectType,
    parseField,parseObject,removePrefix,removeFirstAndLastChars,
    mapCPQField,createApiName,transformToUserField
}