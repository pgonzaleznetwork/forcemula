const MetadataType = require('../MetadataTypes');

interface Metadata{
    //refactor to enum
    type: InstanceType<typeof MetadataType>;
    instance: string;
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

    public parse(): Metadata{

        return {
            type: (this.isCustom() ? MetadataType.CUSTOM_OBJECT : MetadataType.STANDARD_OBJECT),
            instance: this.objectName
        }
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

    public isCustom(): boolean{
        return this.fieldName.toUpperCase().endsWith('__C');
    }

    public parse(): Metadata{

        return {
            type: (this.isCustom() ? MetadataType.CUSTOM_FIELD : MetadataType.STANDARD_FIELD ),
            instance: this.getApiName()
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

class CustomMetadataType{

    name: string;

    constructor(name: string){
        this.name = name;
    }

    public static isTypeOf(token: string): boolean{
        return token.toUpperCase().includes('__MDT');
    }

    public parse(): Metadata{

        return {
            type: MetadataType.CUSTOM_METADATA_TYPE,
            instance: this.name
        }
    }

}

class SObjectType{

    name: string;

    constructor(name: string){
        this.name = name;
    }

    public static isTypeOf(token: string): boolean{
        return token.toUpperCase().startsWith('$OBJECTTYPE.');
    }

    public parse(): Metadata[]{

        //$ObjectType.Center__c.Fields.My_text_field__c
        let [mdType,objectName,prop,fieldName] = this.name.split('.');

        const Metadatas: Metadata[] = []

        if(CustomMetadataType.isTypeOf(objectName)){
            Metadatas.push(new CustomMetadataType(objectName).parse());
        }
        else{
            Metadatas.push(new SObject(objectName).parse());
        }

        Metadatas.push(new Field(objectName,fieldName).parse());

        return Metadatas;       

    }
}

class CustomLabelParser{

    name: string;

    constructor(name: string){
        this.name = name;
    }

    public static isTypeOf(token: string): boolean{
        return token.toUpperCase().startsWith('$LABEL.');
    }
}

export {Field,SObjectFieldParser,CustomLabelParser,SObjectType}