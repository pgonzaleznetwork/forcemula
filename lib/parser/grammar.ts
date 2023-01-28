const RELATIONSHIP_SUFFIX: string = '__R';

const STRING_DELIMETER: string = '"';

const STANDARD_RELATIONSHIP_ID_NAME: string = 'Id';

const CUSTOM_ENTITY_SUFFIX: string = '__C';

const USER_FIELDS: string[] = ['OWNER','MANAGER','CREATEDBY','LASTMODIFIEDBY'];

const CPQ_NAMESPACE: string = 'SBQQ__';

const SPECIAL_PREFIXES: string[] = ['$USER','$PROFILE','$ORGANIZATION','$USERROLE','$SYSTEM'];

const CUSTOM_METADATA_PREFIX: string = '__MDT';

const CUSTOM_LABEL_PREFIX: string = '$LABEL.';

const CUSTOM_SETTING_PREFIX: string = '$SETUP.';

const OBJECT_TYPE_PREFIX: string = '$OBJECTTYPE.'

const COMMENT_START: string = '/*';

const COMMENT_END: string = '*/';

const SELF_REFERENTIAL_PARENT_FIELD: string = 'PARENTID';

const SELF_REFERENTIAL_PARENT_OBJECT: string = 'PARENT';

const PROCESS_BUILDER_BRACKET_START: string = '[';

const PROCESS_BUILDER_BRACKET_END: string = ']';

const DOLLAR_SIGN: string = '$';

const OPERATORS: string[] = [
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

const FUNCTIONS: string[] = [
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

module.exports = {
    RELATIONSHIP_SUFFIX,STANDARD_RELATIONSHIP_ID_NAME,CUSTOM_ENTITY_SUFFIX,
    USER_FIELDS,CPQ_NAMESPACE,SPECIAL_PREFIXES,
    CUSTOM_METADATA_PREFIX,CUSTOM_LABEL_PREFIX,CUSTOM_SETTING_PREFIX,
    OBJECT_TYPE_PREFIX,COMMENT_START,COMMENT_END,STRING_DELIMETER,
    SELF_REFERENTIAL_PARENT_FIELD,SELF_REFERENTIAL_PARENT_OBJECT,PROCESS_BUILDER_BRACKET_START,
    PROCESS_BUILDER_BRACKET_END,DOLLAR_SIGN,OPERATORS,FUNCTIONS
}