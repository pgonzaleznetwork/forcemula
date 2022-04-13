let _ = require('./utils');

function parseType(value,originalObject){

    let types = new Set();

    //this order matters, we have to evaluate object types before anything else because the syntax can be extremely similar to other types

    if(_.isObjectType(value)){
        types.add(_.parseObjectType(value));
    }
   
    else if(_.isCustomMetadata(value)){
        Array.from(_.parseCustomMetadata(value)).forEach(val => types.add(val));
    }

    else if(_.isCustomLabel(value)){
        types.add(_.parseCustomLabel(value));
    }

    else if(_.isCustomSetting(value)){
        Array.from(_.parseCustomSetting(value)).forEach(val => types.add(val));
    }
   
    else if(_.isRelationshipField(value)){

        let lastKnownParent = '';

        _.parts(value).forEach((field,index,fields) => {

            if(_.isSpecialPrefix(field) || _.isProcessBuilderPrefix(field)) return;
            
            let baseObject = '';
            let isLastField = (fields.length-1 == index);

            if(index == 0){
                baseObject = originalObject;
            }
            else{

                baseObject = fields[index-1];

                if(_.isProcessBuilderPrefix(baseObject)){
                    baseObject = _.removeProcessBuilderBrackets(baseObject);
                }
            }

            if(_.isParent(baseObject) && lastKnownParent != ''){
                baseObject = lastKnownParent;
            }

            fieldName = `${baseObject}.${field}`;
          
            if(!isLastField){

                if(_.isStandardRelationship(fieldName)){
                    fieldName = _.transformToId(fieldName);
                }
                else{
                    fieldName = _.transformToFieldName(fieldName);
                }
            }

            if(_.isCPQRelationship(fieldName)){
                fieldName = _.mapCPQField(fieldName,originalObject)
            }

            if(_.isUserField(fieldName)){
                fieldName = _.transformToUserField(fieldName)
            }

            if(_.isParentField(fieldName) && lastKnownParent == ''){
                lastKnownParent = baseObject;
            }

            else if(_.isParentField(fieldName) && lastKnownParent != ''){
                fieldName = `${lastKnownParent}.${_.parts(fieldName)[1]}`;
            }
            
            parseField(fieldName,originalObject);
        });
    }

    else{
        parseField(value,originalObject);
    }

    function parseField(field,object){

        field = _.removePrefix(field);
        types.add(_.createFieldInstance(field,object))
    }
    
    return Array.from(types);

}

module.exports = parseType;