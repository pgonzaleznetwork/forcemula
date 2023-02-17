const {parts,getField,getObject} = require('./utils');
const check = require('./parser/grammarChecks');
const transform = require('./parser/transformations');
const {FieldAdapter, RelationshipField,
    CustomLabelAdapter,CustomMetadataTypeRecordAdapter,
    CustomSettingAdapter,
    SObjectTypeAdapter} = require('../lib/interfaces/interfaces');

function parseType(token: string,originalObjectName: string){

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

        parts(token).forEach((tokenPart: string,index: number,tokenParts: string[]) => {

            let baseObjectName: string = '';
            let isLastField: boolean = (tokenParts.length-1 == index);
    
            //$User, $Profile, etc
            if(tokenPart.startsWith('$')){
                baseObjectName = tokenPart;
            }
     
            else if(index == 0){
                baseObjectName = originalObjectName;
            }
            else{
                baseObjectName = tokenParts[index-1];
            }

            if(check.isParent(baseObjectName) && lastKnownParentName != ''){
                baseObjectName = lastKnownParentName;
            }

            baseObjectName = removeDollarSign(baseObjectName);
        
            let sObjectField = new FieldAdapter(baseObjectName,tokenPart);
            const rField = new RelationshipField(sObjectField);
           
          
            if(!isLastField){

                if(rField.isStandardRelationship()){
                    sObjectField.setApiName(rField.getNameAsId())
                }
                else{
                    sObjectField.setApiName(rField.getNameWithCustomRelationshipSuffix());
                }
            }

            if(rField.isCPQRelationship()){
                sObjectField.setApiName(rField.getNameAsCPQField(originalObjectName));
            }

            else if(rField.isUserField()){
                sObjectField.setApiName(rField.getNameAsUserField());
            }

            else if(rField.isParentField()){

                if(lastKnownParentName == ''){
                    lastKnownParentName = baseObjectName;
                }
                else{
                    let relationshipField = new FieldAdapter(lastKnownParentName,sObjectField.getFieldName());
                    sObjectField.setApiName(relationshipField.getApiName());
                    
                }
            }
            
            parseField(sObjectField);
        });
    }

    else{      
        //we reach here if the formula is a single field, like "Name", which is valid syntax
        let sObjectField = new FieldAdapter(originalObjectName,token);
        parseField(sObjectField);
    }

    function parseField(sObjectField: InstanceType<typeof FieldAdapter>){

        sObjectField.setApiName(sObjectField.getApiName())

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