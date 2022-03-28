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

let isInterestingOperator = operator => ![',','(',')'].includes(operator);

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

module.exports = {isFunction,isOperator,removeWhiteSpace,isCustomField,isInterestingOperator}