let _ = require('../lib/utils');

function parseField(field){

    let fieldNames = new Set();

    field.split('.').forEach((field,index,fields) => {
        
        //the first part is always the object name so we ignore it
        if(index == 0) return;

        let baseObject = fields[index-1];
        let isLastField = (fields.length-1 == index);
        let fieldName = `${baseObject}.${field}`;

        if(!isLastField){
            
            if(_.isStandardRelationship(field)){
                fieldName += 'Id';
            }
            else{
                //this is a custom relationship so we transform custom__r to custom__c
                fieldName = fieldName.slice(0, -1)
                fieldName += 'c';
            }
        }

        fieldNames.add(fieldName);

    });

    
    return fieldNames;

}

module.exports = parseField;