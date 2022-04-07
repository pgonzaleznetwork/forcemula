let _ = require('./utils');

function parseType(value,originalObject){

    let types = new Set();

    if(_.isCustomMetadata(value)){
        let values = _.parseCustomMetadata(value)
        types.add(...values);
    }

    else if(_.isCustomLabel(value)){
        types.add(_.parseCustomLabel(value));
    }

    else if(_.isCustomSetting(value)){
        types.add(_.parseCustomSetting(value));
    }

    else if(_.isObjectType(value)){
        types.add(_.parseObjectType(value));
    }
   
    else if(_.isRelationshipField(value)){

        value = _.removePrefix(value);
        let lastKnownParent = '';

        value.split('.').forEach((field,index,fields) => {
            
            let baseObject = '';

            if(index == 0){
                baseObject = originalObject;
            }
            else{
                baseObject = fields[index-1];
            }

            if(_.isParent(baseObject) && lastKnownParent != ''){
                baseObject = lastKnownParent;
            }

            fieldName = `${baseObject}.${field}`;
          
            let isLastField = (fields.length-1 == index);
 
            if(!isLastField){

                if(_.isStandardRelationship(fieldName)){
                    fieldName = _.transformToId(fieldName);
                }
                else{
                    fieldName = _.transformToFieldName(fieldName);
                }
            }

            if(_.isUserField(fieldName)){
                fieldName = _.transformToUserField(fieldName)
            }

            if(_.isParentField(fieldName) && lastKnownParent == ''){
                lastKnownParent = baseObject;
            }

            else if(_.isParentField(fieldName) && lastKnownParent != ''){
                let parts = fieldName.split('.');
                fieldName = `${lastKnownParent}.${parts[1]}`;
            }
            
            determineFieldType(fieldName)
        });
    }

    else{
        determineFieldType(value)
    }

    function determineFieldType(fieldName){

        if(_.isCustomField(fieldName)){
            types.add(_.parseCustomField(fieldName,originalObject));
        }
        else{
            types.add(_.parseStandardField(fieldName,originalObject));
        }
    }
    
    return Array.from(types);

}

module.exports = parseType;