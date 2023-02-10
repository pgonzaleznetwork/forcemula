const {parts,getField,getObject} = require('./utils');
const check = require('./parser/grammarChecks');
const transform = require('./parser/transformations');
const {Field} = require('../lib/interfaces/interfaces');

function parseType(token: string,originalObjectName: string){

    let types = []

    //this order matters, we have to evaluate object types before anything else because the syntax can be extremely similar to other types

    if(check.isObjectType(token)){
        types.push(...transform.parseObjectType(token))
    }
   
    else if(check.isCustomMetadata(token)){
        types.push(...transform.parseCustomMetadata(token))
    }

    else if(check.isCustomLabel(token)){
        types.push(transform.parseCustomLabel(token));
    }

    else if(check.isCustomSetting(token)){
        types.push(...transform.parseCustomSetting(token))
    }
   
    else if(check.isRelationshipField(token)){

        let lastKnownParentName = '';

        parts(token).forEach((tokenPart,index,tokenParts) => {

            if(check.isSpecialPrefix(tokenPart) || check.isProcessBuilderPrefix(tokenPart)) return;
            
            let baseObjectName = '';
            let isLastField = (tokenParts.length-1 == index);

            if(index == 0){
                baseObjectName = originalObjectName;
            }
            else{

                baseObjectName = tokenParts[index-1];

                if(check.isProcessBuilderPrefix(baseObjectName)){
                    baseObjectName = transform.removeFirstAndLastChars(baseObjectName);
                }
            }

            if(check.isParent(baseObjectName) && lastKnownParentName != ''){
                baseObjectName = lastKnownParentName;
            }

            let sObjectField = new Field(baseObjectName,tokenPart);
           
          
            if(!isLastField){

                if(check.isStandardRelationship(sObjectField.getApiName())){
                    const newApiName = transform.transformToId(sObjectField.getApiName());
                    sObjectField.resetApiName(newApiName);
                    
                }
                else{
                    const newApiName = transform.replaceRwithC(sObjectField.getApiName());
                    sObjectField.resetApiName(newApiName);
                    
                }
            }

            if(check.isCPQRelationship(sObjectField.getApiName())){
                const newApiName = transform.mapCPQField(sObjectField.getApiName(),originalObjectName)
                sObjectField.resetApiName(newApiName);
                
            }

            else if(check.isUserField(sObjectField.getApiName())){
                const newApiName = transform.transformToUserField(sObjectField.getApiName())
                sObjectField.resetApiName(newApiName);
                
            }

            else if(check.isParentField(sObjectField.getApiName())){

                if(lastKnownParentName == ''){
                    lastKnownParentName = baseObjectName;
                }
                else{
                    let relationshipField = new Field(lastKnownParentName,sObjectField.getFieldName());
                    sObjectField.resetApiName(relationshipField.getApiName());
                    
                }
            }
            
            parseField(sObjectField.getApiName(),originalObjectName);
        });
    }

    else{      
        parseField(token,originalObjectName);
    }

    function parseField(fieldName: string,objectName: string){

        fieldName = transform.removePrefix(fieldName);

        //i.e Account.Industry
        if(parts(fieldName).length == 2){

            types.push(transform.parseField(fieldName));
            types.push(transform.parseObject(getObject(fieldName)));
        }
        else{
            //i.e Industry
            types.push(transform.parseField(transform.createApiName(objectName,fieldName)));
            types.push(transform.parseObject(objectName));
        }
    }
    
    return types;

}

module.exports = parseType;