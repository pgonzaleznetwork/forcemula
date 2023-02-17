const MetadataType = require('../MetadataTypes');
const grammar = require('../parser/grammar');

interface Metadata{
    //refactor to enum
    type: InstanceType<typeof MetadataType>;
    instance: string;
}

interface Token{
    value:string;
    originalIndex:number;
    parsedValues:Metadata[]
}

interface MetadataTypeAdapter{
    isTypeOf?(name: string):boolean;
    transform():Metadata[]
}

class CustomEntity{

    public static isTypeOf(name: string): boolean{
        return name.toUpperCase().endsWith('__C');
    }

}

class GenericObjectAdapter implements MetadataTypeAdapter{

    constructor(private _name:string){

    }

    public get name():string{
        return this._name
    }

    public set name(newName: string){
        this._name = newName
    }

    public transform(): Metadata[] {

        let metadatas: Metadata[] = [];

        if(CustomMetadataTypeObjectAdapter.isTypeOf(this._name)){

            metadatas.push(...new CustomMetadataTypeObjectAdapter(this.name).transform());
        }
        else if(CustomEntity.isTypeOf(this._name)){

            metadatas.push({
                type: MetadataType.CUSTOM_OBJECT,
                instance: this._name
            })
        }
        else{
            metadatas.push({
                type: MetadataType.STANDARD_OBJECT,
                instance: this._name
            })
        }

        return metadatas;
    }

}

class Field{

    public isTypeOf(expression: string){

        expression = expression.toUpperCase();

        if(
            !grammar.operators.includes(expression)
            && !grammar.functions.includes(expression)
            && !['$LABEL.','$SETUP.','$OBJECTTYPE.'].includes(expression)   
        ){
            return true;
        }
        return false;
    }

}

class FieldAdapter implements MetadataTypeAdapter{

    private parentObject: GenericObjectAdapter;
    
    constructor(protected objectName: string, protected fieldName: string){
        this.parentObject = new GenericObjectAdapter(objectName);
    }

    public getApiName(): string{
        return `${this.parentObject.name}.${this.fieldName}`;
    }

    public getObjectName(): string{
        return this.parentObject.name;
    }

    public getFieldName(): string{
        return this.fieldName;
    }

    public setApiName(newApiName: string): void{

        if(newApiName.includes('.')){
            const [newObjectName,newFieldName] = newApiName.split('.');
            this.parentObject.name = newObjectName;
            this.fieldName = newFieldName;
        }
        else{
           throw Error('API names must use dot notation, for example Account.Industry')
        }
    }

    public transform(): Metadata[]{

        return [{
            type: (CustomEntity.isTypeOf(this.fieldName) ? MetadataType.CUSTOM_FIELD : MetadataType.STANDARD_FIELD ),
            instance: this.getApiName()
        }]
    }
}

class RelationshipField{

    private sObjectField: FieldAdapter

    constructor(sObjectField: FieldAdapter){
        this.sObjectField = sObjectField;
        //console.log('=======')
        //console.log(this.sObjectField.getObjectName())
        this.sObjectField.setApiName(this.sObjectField.getApiName());
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

class CustomMetadataTypeObjectAdapter implements MetadataTypeAdapter{

    name:string;

    constructor(name: string){
        this.name = name;
    }

    public static isTypeOf(name: string): boolean{
        return name.toUpperCase().endsWith('__MDT');
    }

    public transform(): Metadata[]{

       return [
           {
               type: MetadataType.CUSTOM_METADATA_TYPE,
               instance: this.name
           }
       ]
   }
}

class CustomMetadataTypeRecordAdapter implements MetadataTypeAdapter{

    name: string;

    constructor(name: string){
        this.name = name;
    }

    public static isTypeOf(name: string): boolean{

        //needs to match this format
        //$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c

        let parts: string[] = name.split('.');
        let [mdType,sobject,sobjInstance,fieldName] = parts;

        return (parts.length === 4 && sobject.toUpperCase().endsWith('__MDT'));
    }

    public transform(): Metadata[]{

         //$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c
        let [mdType,sobject,sobjInstance,fieldName] = this.name.split('.');

        return [

            ...new FieldAdapter(sobject,fieldName).transform(),
            ...new CustomMetadataTypeObjectAdapter(sobject).transform(),
            {
                instance: `${sobject}.${sobjInstance}`,
                type: MetadataType.CUSTOM_METADATA_TYPE_RECORD
            }
        ]

    }

}

class SObjectTypeAdapter{

    name: string;

    constructor(name: string){
        this.name = name;
    }

    public static isTypeOf(name: string): boolean{

        //needs to match this format
        //$ObjectType.Center__c.Fields.My_text_field__c

        let parts: string[] = name.split('.');
        let [mdType,objectName,prop,fieldName] = parts;

        return (parts.length === 4 && (mdType.toUpperCase() == '$OBJECTTYPE'));
    }

    public transform(): Metadata[]{

        //$ObjectType.Center__c.Fields.My_text_field__c
        let [mdType,objectName,prop,fieldName] = this.name.split('.');

        return [
            ...new GenericObjectAdapter(objectName).transform(),
            ...new FieldAdapter(objectName,fieldName).transform()
        ]

    }
}

class CustomLabelAdapter implements MetadataTypeAdapter{

    name: string;

    constructor(name: string){

        if(!CustomLabelAdapter.isTypeOf(name)){
            throw new Error(`${name} is not a valid instance of a Custom Label`);
        }
        else{
            this.name = name;
        }
    }

    public static isTypeOf(name: string): boolean{

        const parts = name.toUpperCase().split('.');
        return parts.length === 2 && parts[0] === '$LABEL';
    }

    public transform(): Metadata[] {

        const parts = this.name.split('.');

        return [
            {
            type:MetadataType.CUSTOM_LABEL,
            instance: parts[1]
            }
        ]
    }
}

class CustomSettingAdapter implements MetadataTypeAdapter{

    name: string;

    constructor(name: string){

        if(!CustomSettingAdapter.isTypeOf(name)){
            throw new Error(`${name} is not a valid instance of a Custom Setting`);
        }
        else{
            this.name = name;
        }
    }

    public static isTypeOf(name: string): boolean{

        const parts = name.toUpperCase().split('.');
        return parts.length === 3 && parts[0] === '$SETUP';
    }

    public transform(): Metadata[] {

        const [prefix,object,field] = this.name.split('.');

        return [
            {
            type:MetadataType.CUSTOM_SETTING,
            instance: object
            },
            ...new FieldAdapter(object,field).transform()
        ]
    }
}

export {FieldAdapter,RelationshipField,
    CustomLabelAdapter,CustomSettingAdapter,
    SObjectTypeAdapter,CustomMetadataTypeRecordAdapter}