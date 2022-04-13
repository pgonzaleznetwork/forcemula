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

let removeWhiteSpace = value => value.replace(/\s/g,'');

let isNothing = value => (value == null || value == undefined || value == '');

let isNumber = value => !isNaN(value);

let isInterestingOperator = operator => ![',','(',')'].includes(operator);

let isStandardRelationship = value => !$(value).endsWith('__R');

let isRelationshipField = value => value.includes('.');

let isCustomField = value => $(value).endsWith('__C');

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

let transformToFieldName = value => {

    value = value.slice(0, -1)
    value += 'c';
    return value;
}

let parseCustomMetadata = value => {

    //example >> $CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c'
    let [mdType,sobject,sobjInstance,fieldName] = parts(value);

    return [
        {
            instance : `${sobject}.${sobjInstance}`,
            type: ValueType.CUSTOM_METADATA_TYPE
        },
        createFieldInstance(fieldName,sobject) 
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
        createFieldInstance(field,object) 
    ]
}

let parseObjectType = value => {

    //example `$ObjectType.Center__c.Fields.My_text_field__c`
    let [mdType,sobject,prop,fieldName] = parts(value);

    return createFieldInstance(fieldName,sobject) 
}

let createFieldInstance = (value,object) => {

    if(!value.includes('.')){
        value =  `${object}.${value}`;
    }

    return {
        type: (isCustomField(value) ? ValueType.CUSTOM_FIELD : ValueType.STANDARD_FIELD ),
        instance: value
    } 
}

let removePrefix = value => {

    if(value.startsWith('$')){
        value = value.substring(1);
    }

    return value;
}

let removeProcessBuilderBrackets = value => value.slice(1).slice(0,-1)

let mapCPQField = (value,originalObject) => {

    let [relationshipName,field] = parts(value);

    let realObjectName = cpqMapping[$(originalObject)]?.[$(relationshipName)];

    return `${realObjectName ? realObjectName : relationshipName}.${field}`;;
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

module.exports = {isFunction,isOperator,removeWhiteSpace,up,parts,
    isCustomField,isInterestingOperator,isNumber,isNothing,removeProcessBuilderBrackets,
    isStandardRelationship,isParent,createFieldInstance,isCPQRelationship,
    transformToId,removePrefix,isParentField,isProcessBuilderPrefix,mapCPQField,
transformToFieldName,isUserField,transformToUserField,isCustomMetadata,parseCustomMetadata,
isCustomLabel,parseCustomLabel,isObjectType,parseObjectType,
isCustomSetting,parseCustomSetting,isRelationshipField,isSpecialPrefix}