class Field{
    
    constructor(protected objectName: string, protected fieldName: string){
    }

    public getApiName(): string{
        return `${this.objectName}.${this.fieldName}`;
        //return (this.removePrefix(apiName));
    }

    public getObjectName(): string{
        return this.objectName;
    }

    public getFieldName(): string{
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

    private sObjectField: Field

    constructor(sObjectField: Field){
        this.sObjectField = sObjectField;
        this.sObjectField.setApiName(this.removeMergeFieldPrefix(this.sObjectField.getApiName()));
    }

    private RELATIONSHIP_SUFFIX = '__R';
    private USER_FIELDS = ['OWNER','MANAGER','CREATEDBY','LASTMODIFIEDBY'];
    private SELF_REFERENTIAL_PARENT_FIELD = 'PARENTID';
    private STANDARD_RELATIONSHIP_ID_NAME = 'Id';

    public isStandardRelationship(): boolean{
        return !this.sObjectField.getApiName().toUpperCase().endsWith(this.RELATIONSHIP_SUFFIX);
    }

    public isCPQRelationship(): boolean{

        const upperObjectName =  this.sObjectField.getObjectName().toUpperCase();
        return upperObjectName.startsWith('SBQQ__') && upperObjectName.endsWith(this.RELATIONSHIP_SUFFIX);
    }

    public isUserField(): boolean {
        const upperObjectName =  this.sObjectField.getObjectName().toUpperCase();
        return this.USER_FIELDS.includes(upperObjectName)
    }

    public isParentField(): boolean{
        return this.sObjectField.getFieldName().toUpperCase() == this.SELF_REFERENTIAL_PARENT_FIELD;
    }

    public getNameAsId(): string {
        let apiName = this.sObjectField.getApiName()
        return apiName+this.STANDARD_RELATIONSHIP_ID_NAME;
    }

    public getNameAsUserField(): string{
        let fieldName = this.sObjectField.getFieldName();
        return  `User.${fieldName}`;
    }

    public getNameWithCustomRelationshipSuffix(): string {
        let apiName = this.sObjectField.getApiName()
        return apiName.slice(0,-1).concat('c');
    }

    public getNameAsCPQField (originalObject: string): string {

        const cpqMapping = require('../mappings/cpq');

        const [relationshipName,field] = this.sObjectField.getApiName().split('.');

        let apiName = cpqMapping[originalObject.toUpperCase()]?.[relationshipName.toUpperCase()];
    
        return `${apiName ? apiName : relationshipName}.${field}`
    
    }

    public removeMergeFieldPrefix(apiName: string): string{
        let nameWithoutPrefix = apiName.startsWith('$') ? apiName.substring(1) : apiName;
        return nameWithoutPrefix;
    }
}

class ObjectTypeParser{

    private token: string;

    constructor(token: string){
        this.token = token;
    }

}

export {Field,SObjectFieldParser}