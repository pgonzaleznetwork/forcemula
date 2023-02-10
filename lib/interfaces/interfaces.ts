class Field{
    
    constructor(protected objectName: string, protected fieldName: string){
    }

    getApiName(): string{
        return `${this.objectName}.${this.fieldName}`;
    }

    getObjectName(): string{
        return this.objectName;
    }

    getFieldName(): string{
        return this.fieldName;
    }

    public setApiName(newApiName: string): void{

        if(newApiName.includes('.')){
            const [newObjectName,newFieldName] = newApiName.split('.');
            this.objectName = newObjectName;
            this.fieldName = newFieldName;
        }
        else{
           throw Error('API names must use dot notation, for example Account.Industry')
        }
    }

}

class SObjectFieldParser{

    constructor(private sObjectField: Field){

    }

    private RELATIONSHIP_SUFFIX = '__R';
    private USER_FIELDS = ['OWNER','MANAGER','CREATEDBY','LASTMODIFIEDBY'];
    private SELF_REFERENTIAL_PARENT_FIELD = 'PARENTID';
    private STANDARD_RELATIONSHIP_ID_NAME = 'Id';

    isStandardRelationship(): boolean{
        return !this.sObjectField.getApiName().toUpperCase().endsWith(this.RELATIONSHIP_SUFFIX);
    }

    isCPQRelationship(): boolean{

        const upperObjectName =  this.sObjectField.getObjectName().toUpperCase();
        return upperObjectName.startsWith('SBQQ__') && upperObjectName.endsWith(this.RELATIONSHIP_SUFFIX);
    }

    isUserField(): boolean {
        const upperObjectName =  this.sObjectField.getObjectName().toUpperCase();
        return this.USER_FIELDS.includes(upperObjectName)
    }

    isParentField(): boolean{
        return this.sObjectField.getFieldName().toUpperCase() == this.SELF_REFERENTIAL_PARENT_FIELD;
    }

    getNameAsId(): string {
        let apiName = this.sObjectField.getApiName()
        return apiName+this.STANDARD_RELATIONSHIP_ID_NAME;
    }

    getNameAsUserField(): string{
        let fieldName = this.sObjectField.getFieldName();
        return  `User.${fieldName}`;
    }

    getNameWithCustomRelationshipSuffix(): string {
        let apiName = this.sObjectField.getApiName()
        return apiName.slice(0,-1).concat('c');
    }

    getNameAsCPQField (originalObject: string): string {

        const cpqMapping = require('../mappings/cpq');

        const [relationshipName,field] = this.sObjectField.getApiName().split('.');

        let apiName = cpqMapping[originalObject.toUpperCase()]?.[relationshipName.toUpperCase()];
    
        return `${apiName ? apiName : relationshipName}.${field}`
    
    }

}

export {Field,SObjectFieldParser}