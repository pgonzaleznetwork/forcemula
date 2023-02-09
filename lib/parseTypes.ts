let _ = require('./utils');
let check = require('./parser/grammarChecks');
let transform = require('./parser/transformations');

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

        _.parts(token).forEach((tokenPart,index,tokenParts) => {

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

            let fieldApiName = transform.createApiName(baseObjectName,tokenPart);
          
            if(!isLastField){

                if(check.isStandardRelationship(fieldApiName)){
                    fieldApiName = transform.transformToId(fieldApiName);
                }
                else{
                    fieldApiName = transform.replaceRwithC(fieldApiName);
                }
            }

            if(check.isCPQRelationship(fieldApiName)){
                fieldApiName = transform.mapCPQField(fieldApiName,originalObjectName)
            }

            else if(check.isUserField(fieldApiName)){
                fieldApiName = transform.transformToUserField(fieldApiName)
            }

            else if(check.isParentField(fieldApiName)){

                if(lastKnownParentName == ''){
                    lastKnownParentName = baseObjectName;
                }
                else{
                    fieldApiName = transform.createApiName(lastKnownParentName,_.getField(fieldApiName));
                }
            }
            
            parseField(fieldApiName,originalObjectName);
        });
    }

    else{      
        parseField(token,originalObjectName);
    }

    function parseField(field,object){

        field = transform.removePrefix(field);

        //i.e Account.Industry
        if(_.parts(field).length == 2){

            types.push(transform.parseField(field));
            types.push(transform.parseObject(_.getObject(field)));
        }
        else{
            //i.e Industry
            types.push(transform.parseField(transform.createApiName(object,field)));
            types.push(transform.parseObject(object));
        }
    }
    
    return types;

}

module.exports = parseType;