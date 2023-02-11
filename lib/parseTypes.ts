

const {parts,getField,getObject} = require('./utils');
const check = require('./parser/grammarChecks');
const transform = require('./parser/transformations');
const {Field, SObjectFieldParser} = require('../lib/interfaces/interfaces');

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
            const parser = new SObjectFieldParser(sObjectField);
           
          
            if(!isLastField){

                if(parser.isStandardRelationship()){
                    sObjectField.setApiName(parser.getNameAsId())
                }
                else{
                    sObjectField.setApiName(parser.getNameWithCustomRelationshipSuffix());
                }
            }

            if(parser.isCPQRelationship()){
                sObjectField.setApiName(parser.getNameAsCPQField(originalObjectName));
            }

            else if(parser.isUserField()){
                sObjectField.setApiName(parser.getNameAsUserField());
            }

            else if(parser.isParentField()){

                if(lastKnownParentName == ''){
                    lastKnownParentName = baseObjectName;
                }
                else{
                    let relationshipField = new Field(lastKnownParentName,sObjectField.getFieldName());
                    sObjectField.setApiName(relationshipField.getApiName());
                    
                }
            }
            
            parseField(sObjectField);
        });
    }

    else{      
        //we reach here if the formula is a single field, like "Name", which is valid syntax
        let sObjectField = new Field(originalObjectName,token);
        parseField(sObjectField);
    }

    function parseField(sObjectField: InstanceType<typeof Field>){

        sObjectField.setApiName(sObjectField.getApiName())

        types.push(transform.parseField(sObjectField.getApiName()));
        types.push(transform.parseObject(sObjectField.getObjectName()));
    }
    
    return types;

}

module.exports = parseType;