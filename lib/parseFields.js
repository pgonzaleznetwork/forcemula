let _ = require('../lib/utils');

function parseField(field){

    let fieldNames = new Set();

    field.split('.').forEach((field,index,fields) => {
        
        //the first part is always the object name so we ignore it
        if(index == 0) return;

        let baseObject = fields[index-1];

        console.log('what is base object ',baseObject,fields,index)

        if(_.isStandardRelationship(baseObject)){

            console.log('what is field ', field)

            if(_.isStandardRelationship(field)){

                //if this is not the end of the array, it means there's another field after this one (Account.Owner.Name)
                //so we convert this field to its relationship name i.e Account.OwnerId
                if((fields.length-1 != index)){
                    fieldNames.add(`${baseObject}.${field}Id`);
                }
                //end of the array, so we return the name as is i.e Account.Name
                else{
                    fieldNames.add(`${baseObject}.${field}`);
                }
            }
            
            else{

                //this is a custom relationship so we transform custom__r to custom__c
                let fieldName = field.slice(0, -1)
                fieldName += 'c';
                
                fieldNames.add(`${baseObject}.${fieldName}`);
            }
        }

        else{
            //we can't figure out which object this is so we return the name as is

            //even though I don't know this object, I can figure out if there's a next field

            //if this is not the end of the array, it means there's another field after this one (Account.Owner.Name)
            //so we convert this field to its relationship name i.e Account.OwnerId
            if((fields.length-1 != index)){
                fieldNames.add(`${baseObject}.${field}Id`);
            }
            //end of the array, so we return the name as is i.e Account.Name
            else{
                fieldNames.add(`${baseObject}.${field}`);
            }

            //fieldNames.add(`${baseObject}.${field}`);

        }

    });

    
    return fieldNames;

}

module.exports = parseField;