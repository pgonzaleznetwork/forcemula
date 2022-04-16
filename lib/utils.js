let ValueType = require('../lib/ValueTypes');
let cpqMapping = require('../lib/mappings/cpq');

//internally we use this as $(), externally as up()
let up = value => value.toUpperCase();
let $ = up;

//internal utilities
let parts = value => value.split('.');
let getObject = value => parts(value)[0];
let getField = value => parts(value)[1];

//external utilities

let isCommentStart = value => value == '/*';
let isCommentEnd = value => value == '*/';

let removeWhiteSpace = value => value.replace(/\s/g,'');

let isNothing = value => (value == null || value == undefined || value == '');

let isNumber = value => !isNaN(value);

let isInterestingOperator = operator => ![',','(',')'].includes(operator);

let isStandardRelationship = value => !$(value).endsWith('__R');

let isRelationshipField = value => value.includes('.');

let isCustom = value => $(value).endsWith('__C');

let isUserField = value => ['OWNER','MANAGER','CREATEDBY','LASTMODIFIEDBY'].includes($(getObject(value)));

let transformToUserField = value => `User.${getField(value)}`;

let isCustomMetadata = value => $(value).includes('__MDT');

let isCustomLabel = value => $(value).startsWith('$LABEL.');

let isCustomSetting = value => $(value).startsWith('$SETUP.');

let isObjectType = value => $(value).startsWith('$OBJECTTYPE.');

let isSpecialPrefix = value => ['$USER','$PROFILE','$ORGANIZATION','$USERROLE','$SYSTEM'].includes($(value));

let isParentField = value => $(getField(value)) == 'PARENTID';

let isParent = value => $(value) == 'PARENT';

let isProcessBuilderPrefix = value => (value.startsWith('[') && value.endsWith(']'))

let isCPQRelationship = value => $(getObject(value)).startsWith('SBQQ__') && $(getObject(value)).endsWith('__R');

let transformToId = value => value+='Id';

let isOperator = char => {

    if(isNothing(char)) return false;
    return operators.includes(char.trim());
}

let isFunction = value => {
    
    if(isNothing(value)) return false;
    
    return functions.includes($(value.trim()));
};

let replaceRwithC = value => value.slice(0,-1).concat('c');

let createApiName = (object,field) => `${object}.${field}`;

let parseCustomMetadata = value => {

    //$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c
    let [mdType,sobject,sobjInstance,fieldName] = parts(value);

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
        instance:getField(value)
    }
}

let parseCustomSetting = value => {

    let [prefix,object,field] = parts(value);

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
    let [mdType,sobject,prop,fieldName] = parts(value);

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

let removePrefix = value =>  value.startsWith('$') ? value.substring(1) : value

let removeFirstAndLastChars = value => value.slice(1).slice(0,-1)

let mapCPQField = (value,originalObject) => {

    let [relationshipName,field] = parts(value);

    let apiName = cpqMapping[$(originalObject)]?.[$(relationshipName)];

    return createApiName(apiName ? apiName : relationshipName,field)

}

let operators = [
    `+`,
    `-`,
    `*`,
    `/`,
    `^`,
    `(`,
    `)`,
    `=`,
    `<`,
    `>`,
    `&`,
    `|`,
    `!`,
    `,`,
    
]

let functions = [
    `TRUE`,
    `FALSE`,
    `ADDMONTHS`,
    `DATE`,
    `DATEVALUE`,
    `DATETIMEVALUE`,
    `DAY`,
    `HOUR`,
    `MILLISECOND`,
    `MINUTE`,
    `MONTH`,
    `NOW`,
    `SECOND`,
    `TIMEVALUE`,
    `TODAY`,
    `WEEKDAY`,
    `YEAR`,
    `AND`,
    `BLANKVALUE`,
    `CASE`,
    `IF`,
    `ISBLANK`,
    `ISCLONE`,
    `ISNEW`,
    `ISNULL`,
    `ISNUMBER`,
    `NOT`,
    `NOTVALUE`,
    `OR`,
    `PRIORVALUE`,
    `ABS`,
    `CEILING`,
    `DISTANCE`,
    `EXP`,
    `FLOOR`,
    `GEOLOCATION`,
    `LN`,
    `LOG`,
    `MAX`,
    `MCEILING`,
    `MFLOOR`,
    `MIN`,
    `MOD`,
    `ROUND`,
    `SQRT`,
    `BEGINS`,
    `BR`,
    `CASESAFEID`,
    `CONTAINS`,
    `FIND`,
    `GETSESSIONID`,
    `HTMLENCODE`,
    `HYPERLINK`,
    `IMAGE`,
    `INCLUDES`,
    `ISPICKVAL`,
    `JSENCODE`,
    `JSINHTMLENCODE`,
    `LEFT`,
    `LEN`,
    `LOWER`,
    `LPAD`,
    `MID`,
    `RIGHT`,
    `RPAD`,
    `SUBSTITUTE`,
    `TEXT`,
    `TRIM`,
    `UPPER`,
    `URLENCODE`,
    `VALUE`,
    `PARENTGROUPVAL`,
    `PREVGROUPVAL`,
    `CURRENCYRATE`,
    `GETRECORDIDS`,
    `IMAGEPROXYURL`,
    `INCLUDE`,
    `ISCHANGED`,
    `JUNCTIONIDLIST`,
    `LINKTO`,
    `PREDICT`,
    `REGEX`,
    `REQUIRESCRIPT`,
    `URLFOR`,
    `VLOOKUP`,
]

module.exports = {isFunction,isOperator,removeWhiteSpace,up,parts,getObject,getField,
    isCustom,isInterestingOperator,isNumber,isNothing,removeFirstAndLastChars,
    isStandardRelationship,isParent,parseField,isCPQRelationship,parseObject,createApiName,
    transformToId,removePrefix,isParentField,isProcessBuilderPrefix,mapCPQField,
replaceRwithC,isUserField,transformToUserField,isCustomMetadata,parseCustomMetadata,
isCustomLabel,parseCustomLabel,isObjectType,parseObjectType,isCommentStart,isCommentEnd,
isCustomSetting,parseCustomSetting,isRelationshipField,isSpecialPrefix}