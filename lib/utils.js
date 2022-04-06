let ValueType = require('../lib/ValueTypes');

let isOperator = char => {

    if(isNothing(char)) return false;

    char = char.trim();
    return operators.includes(char);
}

let isFunction = word => {
    
    if(isNothing(word)) return false;
    
    word = word.trim();
    word = word.toUpperCase();
    return functions.includes(word);
};

let removeWhiteSpace = word => word.replace(/\s/g,'');

let isNothing = value => (value == null || value == undefined || value == '');

let isCustomField = word => {

    if(isNothing(word)) return false;
    
    return word.includes('__c');
}

function isNumber(val){
    return !isNaN(val)
}

let isInterestingOperator = operator => ![',','(',')'].includes(operator);

let isStandardRelationship = field => !field.includes(`__r`);

let transformToId = field => field+='Id';

let transformToFieldName = field => {
    field = field.slice(0, -1)
    field += 'c';
    return field;
}

let isUserField = field => {

    let object = field.split('.')[0];
    
    return ['OWNER','MANAGER','CREATEDBY','LASTMODIFIEDBY'].includes(object.toUpperCase());

}

let transformToUserField = field => `User.${field.split('.')[1]}`;

let isCustomMetadata = field => field.includes('__mdt');

let parseCustomMetadata = field => {

    //example >> $CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c'
    let [mdType,sobject,sobjInstance,fieldName] = field.split('.');

    let customField = {
        instance : `${sobject}.${fieldName}`,
        type: ValueType.CUSTOM_FIELD
    }

    let metadataType = {
        instance : `${sobject}.${sobjInstance}`,
        type: ValueType.CUSTOM_METADATA_TYPE
    }

    return [customField,metadataType];
}

let isCustomLabel = value => value.toUpperCase().startsWith('$LABEL.');

let parseCustomLabel = value => {

    return {
        type:ValueType.CUSTOM_LABEL,
        instance:value.split('.')[1]
    }
}

let isCustomSetting = value => value.toUpperCase().startsWith('$SETUP.');

let parseCustomSetting = value => {

    return {
        type:ValueType.CUSTOM_SETTING,
        instance:value.split('.')[1]
    }
}

let isObjectType = value => value.toUpperCase().startsWith('$OBJECTTYPE.');

let parseObjectType = value => {

    //example `$ObjectType.Center__c.Fields.My_text_field__c`
    let [mdType,sobject,prop,fieldName] = value.split('.');

    return {
        type:ValueType.CUSTOM_FIELD,
        instance:`${sobject}.${fieldName}`
    }
}

let isRelationshipField = value => value.includes('.');

let removePrefix = field => {

    if(field.startsWith('$')){
        field = field.substring(1);
    }

    return field;
}

let isSpecialPrefix = value => {
    return ['USER','PROFILE','ORGANIZATION','USERROLE'].includes(value.toUpperCase());
}

let parseCustomField = (value,originalObject) => {

    if(!value.includes('.')){
        value =  `${originalObject}.${value}`;
    }

    return {
        type:ValueType.CUSTOM_FIELD,
        instance:value
    }
}

let parseStandardField = (value,originalObject) => {

    if(!value.includes('.')){
        value =  `${originalObject}.${value}`;
    }

    return {
        type:ValueType.STANDARD_FIELD,
        instance:value
    }
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

module.exports = {isFunction,isOperator,removeWhiteSpace,
    isCustomField,isInterestingOperator,isNumber,isNothing,
    isStandardRelationship,
    transformToId,removePrefix,
transformToFieldName,isUserField,transformToUserField,isCustomMetadata,parseCustomMetadata,
isCustomLabel,parseCustomLabel,isObjectType,parseObjectType,parseCustomField,parseStandardField,
isCustomSetting,parseCustomSetting,isRelationshipField,isSpecialPrefix}