const MetadataType = require('../MetadataTypes');

interface FormulaToken{
    //refactor to enum
    metadataType: InstanceType<typeof MetadataType>;
    instanceName: string;
}

class SObject{

    constructor(protected objectName: string){
    }

    public isCustom(): boolean{
        return this.objectName.toUpperCase().endsWith('__C');
    }

    public getName(): string{
        return this.objectName;
    }

    public setName(newName: string): void{
        this.objectName = newName;
    }

    public parse(): FormulaToken{

        let type;

        if(this.isCustom()){
            type = MetadataType.CUSTOM_OBJECT;
        }
        else{
            type = MetadataType.STANDARD_OBJECT;
        }

        let parsedObject: FormulaToken = {
            metadataType: type,
            instanceName: this.objectName
        }

        return parsedObject;
    }
}

class Field{

    parentObject: SObject;
    
    constructor(protected objectName: string, protected fieldName: string){
        this.parentObject = new SObject(objectName);
    }

    public getApiName(): string{
        return `${this.parentObject.getName()}.${this.fieldName}`;
    }

    public getObjectName(): string{
        return this.parentObject.getName();
    }

    public getFieldName(): string{
        return this.fieldName;
    }

    public setApiName(newApiName: string): void{

        if(newApiName.includes('.')){
            const [newObjectName,newFieldName] = newApiName.split('.');
            this.parentObject.setName(newObjectName);
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

/*class SObjectParser{

    token: string;

    constructor(token: string){
        this.token = token;
    }

    public static isTypeOf(token: string): boolean{
        return token.toUpperCase().startsWith('$OBJECTTYPE.');
    }

    public parse(): {
        //$ObjectType.Center__c.Fields.My_text_field__c
        let [mdType,sobject,prop,fieldName] = this.token.split('.');

        let type = MetadataType.STANDARD_OBJECT;

        if(sobject.toUpperCase().endsWith('__C')){
            type = MetadataType.CUSTOM_OBJECT
        }

        let parsedObject: FormulaToken = {
            metadataType: type,
            instanceName: sobject
        }

        let customFieldType = MetadataType.STANDARD_FIELD;

        if(fieldName.toUpperCase().endsWith('__C')){
            customFieldType = MetadataType.CUSTOM_FIELD;
        }

    }
}*/

class CustomLabelParser{

    private token: string;

    constructor(token: string){
        this.token = token;
    }

    public static isTypeOf(token: string): boolean{
        return token.toUpperCase().startsWith('$LABEL.');
    }
}

export {Field,SObjectFieldParser,CustomLabelParser}