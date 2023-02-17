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

       // console.log('===============')

        let lastKnownParentName: string = '';

        parts(token).forEach((tokenPart: string,index: number,tokenParts: string[]) => {

           // console.log(tokenPart)

            if(check.isSpecialPrefix(tokenPart) || check.isProcessBuilderPrefix(tokenPart)) {
                return;
            }
            
            let baseObjectName: string = '';
            let isLastField: boolean = (tokenParts.length-1 == index);

            if(index == 0){
                baseObjectName = originalObjectName;
            }
            else{

                baseObjectName = tokenParts[index-1];

               // console.log('now base object is ',baseObjectName)

                if(check.isProcessBuilderPrefix(baseObjectName)){
                    console.log('its process builder again ',baseObjectName)
                    baseObjectName = transform.removeFirstAndLastChars(baseObjectName);
                }
            }

            if(check.isParent(baseObjectName) && lastKnownParentName != ''){
                baseObjectName = lastKnownParentName;
            }

            console.log('about to create field class with ',baseObjectName,'.',tokenPart)
            baseObjectName = baseObjectName.startsWith('$') ? baseObjectName.substring(1) : baseObjectName;
            //tokenPart = transform.removePrefix(tokenPart)
            console.log('AFTER about to create field class with ',baseObjectName,'.',tokenPart)

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

module.exports = parseType;