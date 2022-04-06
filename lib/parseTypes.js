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

        value.split('.').forEach((field,index,fields) => {
            
            let baseObject = '';

            if(index == 0){
                baseObject = originalObject;
            }
            else{
                baseObject = fields[index-1];
            }

            fieldName = `${baseObject}.${field}`;
          
            let isLastField = (fields.length-1 == index);
 
            if(!isLastField){

                if(_.isStandardRelationship(field)){
                    fieldName = _.transformToId(fieldName);
                }
                else{
                    fieldName = _.transformToFieldName(fieldName);
                }
            }

            if(_.isUserField(fieldName)){
                fieldName = _.transformToUserField(fieldName)
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
    
    return types;

}

module.exports = parseType;