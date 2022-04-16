let _ = require('./utils');

function parseType(value,originalObject){

    let types = []

    //this order matters, we have to evaluate object types before anything else because the syntax can be extremely similar to other types

    if(_.isObjectType(value)){
        types.push(..._.parseObjectType(value))
    }
   
    else if(_.isCustomMetadata(value)){
        types.push(..._.parseCustomMetadata(value))
    }

    else if(_.isCustomLabel(value)){
        types.push(_.parseCustomLabel(value));
    }

    else if(_.isCustomSetting(value)){
        types.push(..._.parseCustomSetting(value))
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
                    baseObject = _.removeFirstAndLastChars(baseObject);
                }
            }

            if(_.isParent(baseObject) && lastKnownParent != ''){
                baseObject = lastKnownParent;
            }

            fieldName = _.createApiName(baseObject,field);
          
            if(!isLastField){

                if(_.isStandardRelationship(fieldName)){
                    fieldName = _.transformToId(fieldName);
                }
                else{
                    fieldName = _.replaceRwithC(fieldName);
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
                fieldName = _.createApiName(lastKnownParent,_.getField(fieldName));
            }
            
            parseField(fieldName,originalObject);
        });
    }

    else{      
        parseField(value,originalObject);
    }

    function parseField(field,object){

        field = _.removePrefix(field);

        //i.e Account.Industry
        if(_.parts(field).length == 2){

            types.push(_.parseField(field));
            types.push(_.parseObject(_.getObject(field)));
        }
        else{
            //i.e Name
            types.push(_.parseField(_.createApiName(object,field)));
            types.push(_.parseObject(object));
        }
    }
    
    return types;

}

module.exports = parseType;