const {parts,getField,getObject} = require('./utils');
const check = require('./parser/grammarChecks');
const transform = require('./parser/transformations');
const {FieldAdapter,
    CustomLabelAdapter,CustomMetadataTypeRecordAdapter,
    CustomSettingAdapter,
    SObjectTypeAdapter} = require('../lib/interfaces/interfaces');

function parseType(token: string,sourceObjectName: string){

    let types = []

    //this order matters, we have to evaluate object types before anything else because the syntax can be extremely similar to other types


    if(SObjectTypeAdapter.isTypeOf(token)){
        types.push(...new SObjectTypeAdapter(token).transform());
    }

    else if(CustomMetadataTypeRecordAdapter.isTypeOf(token)){
        types.push(...new CustomMetadataTypeRecordAdapter(token).transform());
    }
   
    else if(CustomLabelAdapter.isTypeOf(token)){
        types.push(...new CustomLabelAdapter(token).transform());
    }

    else if(CustomSettingAdapter.isTypeOf(token)){
        types.push(...new CustomSettingAdapter(token).transform());
    }

    
    else if(check.isRelationshipField(token)){

        token = removeProcessBuilderPrefix(token)
  
        let lastKnownParentName: string = '';

        const fields: string[] = token.split('.');

        fields.forEach((field: string,index: number,fields: string[]) => {

            /**
             * The object at the start of the relationship tree i.e {Account}.Owner.FirstName 
             * */ 
            let baseObjectName: string = '';
            let isLastField: boolean = (fields.length-1 == index);
    
            //$User, $Profile, etc
            if(field.startsWith('$')){
                baseObjectName = field;
            }
     
            else if(index == 0){
                baseObjectName = sourceObjectName;
            }
            else{
                //if we are on any field other than the first one, the base object becomes the previous
                //field in the relationship tree, for example if the relationship was Account.Owner
                //and the current field is Owner, the base object becomes Account
                baseObjectName = fields[index-1];
            }

            if(baseObjectName.toUpperCase() === 'PARENT' && lastKnownParentName != ''){
                baseObjectName = lastKnownParentName;
            }

            baseObjectName = removeDollarSign(baseObjectName);

            let fieldApiName = `${baseObjectName}.${field}`;
        
            let sObjectField = new FieldAdapter(baseObjectName,field);
          
            if(!isLastField){

                //Account.Oppty__r
                if(fieldApiName.toUpperCase().endsWith('__R')){
                   //becomes Account.Oppty__c
                    sObjectField.setApiName(fieldApiName.slice(0,-1).concat('c'));
                }
                //Account.Opportunity.
                else{
                    //becomes Account.OpportunityId
                    sObjectField.setApiName(fieldApiName+='Id');
                }
            }

            //Account.SBQQ__OriginalOppty__r.
            if(baseObjectName.toUpperCase().startsWith('SBQQ__') && baseObjectName.toUpperCase().endsWith('__R')){
                //TO DO REPLACE WITH GENERIC FUNCTION TO GET MAPPING
                //sObjectField.setApiName(rField.getNameAsCPQField(sourceObjectName));

                const cpqMapping = require('./mappings/cpq');

                const [relationshipName,field] = sObjectField.getApiName().split('.');
        
                let apiName = cpqMapping[sourceObjectName.toUpperCase()]?.[relationshipName.toUpperCase()];
            
                let newName = `${apiName ? apiName : relationshipName}.${field}`

                sObjectField.setApiName(newName);
            }

            //Owner.Manager__c
            else if(['OWNER','MANAGER','CREATEDBY','LASTMODIFIEDBY'].includes(baseObjectName.toUpperCase())){
                //becomes User.Manager__c
                sObjectField.setApiName(`User.${sObjectField.getFieldName()}`)
                //sObjectField.setApiName(rField.getNameAsUserField());
            }

            else if(sObjectField.getFieldName().toUpperCase() === 'PARENTID'){

                if(lastKnownParentName == ''){
                    lastKnownParentName = baseObjectName;
                }
                else{
                    //let relationshipField = new FieldAdapter(lastKnownParentName,sObjectField.getFieldName());
                    sObjectField.setApiName(`${lastKnownParentName}.${sObjectField.getFieldName()}`);
                    
                }
            }
            
            parseField(sObjectField);
        });
    }

    else{      
        //we reach here if the formula is a single field, like "Name", which is valid syntax
        let sObjectField = new FieldAdapter(sourceObjectName,token);
        parseField(sObjectField);
    }

    function parseField(sObjectField: InstanceType<typeof FieldAdapter>){

        types.push(transform.parseField(sObjectField.getApiName()));
        types.push(transform.parseObject(sObjectField.getObjectName()));
    }
    
    return types;

}

/**
 * 
 * Removes $ from special objects such as $User, $Profile, etc
 */
function removeDollarSign(objectName: string): string{
    return objectName.startsWith('$') ? objectName.substring(1) : objectName;
}

/** Removes [Object] from process builder formulas because the base object is duplicated here
* i.e a process builder formula on the Account would start as [Account].OwnerId
* we already have the base object so we can discard
*/
function removeProcessBuilderPrefix(token: string): string{

    let sanitizedToken: string = token;

    const parts: string[] = token.split('.');

    if(parts[0].startsWith('[') && parts[0].endsWith(']')){
        parts.shift()
        sanitizedToken = parts.join('.');
    }

    return sanitizedToken;
}

module.exports = parseType;