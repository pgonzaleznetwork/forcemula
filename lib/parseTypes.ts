const {FieldAdapter,
    CustomLabelAdapter,CustomMetadataTypeRecordAdapter,
    CustomSettingAdapter,
    SObjectTypeAdapter} = require('../lib/interfaces/interfaces');


function parseType(token: string,sourceObjectName: string){

    let types = []

    const nonFieldAdapters: MetadataTypeAdapter[] = [
        CustomLabelAdapter,
        CustomMetadataTypeRecordAdapter,
        CustomSettingAdapter,
        SObjectTypeAdapter
    ]

    nonFieldAdapters.forEach(adapter => {
        if(adapter.isTypeOf(token)){
            types.push(...new adapter(token).transform());
        }
    })

    //if we get here and there are no types, we can safely assume the token didn't
    //match any of the previous adapter and it's most likely a field expression
    if(types.length == 0){
        
        //is a relationship field i.e Account.OpportunityId
        if(token.includes('.')){

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
                    //nothing to do here, we'll evaluate the second part of the field
                    //i.e $Profile.Name in the next iteration
                    return;
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
                    if(fieldApiName.endsWithIgnoreCase('__R')){
                       //becomes Account.Oppty__c
                        sObjectField.fullName = fieldApiName.slice(0,-1).concat('c');
                    }
                    //Account.Opportunity.
                    else{
                        //becomes Account.OpportunityId
                        sObjectField.fullName = fieldApiName+='Id';
                    }
                }
    
                //Account.SBQQ__OriginalOppty__r.
                if(baseObjectName.startsWithIgnoreCase('SBQQ__') 
                && baseObjectName.endsWithIgnoreCase('__R'))
                {
                    sObjectField.fullName = resolveManagedPackageRelationship('cpq',sourceObjectName,sObjectField);
                }
    
                //Owner.Manager__c
                else if(
                    ['OWNER','MANAGER','CREATEDBY','LASTMODIFIEDBY'].
                    includes(baseObjectName.toUpperCase()))
                {
                    //becomes User.Manager__c
                    sObjectField.fullName = `User.${sObjectField.fieldName}`
                }
    
                else if(sObjectField.fieldName.toUpperCase() === 'PARENTID'){
    
                    if(lastKnownParentName == ''){
                        lastKnownParentName = baseObjectName;
                    }
                    else{
                        sObjectField.fullName = `${lastKnownParentName}.${sObjectField.fieldName}`;
                        
                    }
                }
                types.push(...sObjectField.transform());
            });
        }
    
        else{      
            //we reach here if the formula is a single field, like "Name", which is valid syntax
            let sObjectField = new FieldAdapter(sourceObjectName,token);
            types.push(...sObjectField.transform());
        }
    }
 
    
    return types;

}

/**
 * 
 * This method retrieves a specific managed package mapping of custom relationship names to their actual field names.
 * See ./mappings/cpq for an example
 * 
 * @param packageName The name of the of the managed package we are getting the mapping for
 * @param sourceObjectName 
 * @param sObjectField The field we want to resolve the name for
 * @returns The resolved name of the field
 */
function resolveManagedPackageRelationship(packageName: string,sourceObjectName: string,sObjectField: FieldAdapter): string{

    const mapping = require(`./mappings/${packageName}`);
    
    const [relationshipName,field] = sObjectField.fullName.split('.');

    let apiName = mapping[sourceObjectName.toUpperCase()]?.[relationshipName.toUpperCase()];

    let newName = `${apiName ? apiName : relationshipName}.${field}`

    return newName;

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

String.prototype.startsWithIgnoreCase = function(input: string): boolean{
    if(input){
        const upperInput = input.toUpperCase();
        return this.toUpperCase().startsWith(upperInput);
    }
    return false;
    
}

String.prototype.endsWithIgnoreCase = function(input: string): boolean{
    if(input){
        const upperInput = input.toUpperCase();
        return this.toUpperCase().endsWith(upperInput);
    }
    return false;
}

export {parseType}

module.exports = parseType;