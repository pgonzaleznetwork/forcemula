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
        return name.endsWithIgnoreCase('__c');
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
        else if(!this._name.endsWithIgnoreCase('__r')){
            metadatas.push({
                type: MetadataType.STANDARD_OBJECT,
                instance: this._name
            })
        }
        else{
            metadatas.push({
                type: MetadataType.UNKNOWN_RELATIONSHIP,
                instance:this._name
            })
        }

        return metadatas;
    }

}

class FieldAdapter implements MetadataTypeAdapter{

    private parentObject: GenericObjectAdapter;
    
    constructor(protected object: string, protected field: string){
        this.parentObject = new GenericObjectAdapter(object);
    }

    public get fullName(): string{
        return `${this.parentObject.name}.${this.field}`;
    }

    public get objectName(): string{
        return this.parentObject.name;
    }

    public get fieldName(): string{
        return this.field;
    }

    public set fullName(newApiName: string){

        if(newApiName.includes('.')){
            const [newObjectName,newFieldName] = newApiName.split('.');
            this.parentObject.name = newObjectName;
            this.field = newFieldName;
        }
        else{
           throw Error('API names must use dot notation, for example Account.Industry')
        }
    }

    public transform(): Metadata[]{

        return [
            {
                type: (CustomEntity.isTypeOf(this.field) ? MetadataType.CUSTOM_FIELD : MetadataType.STANDARD_FIELD ),
                instance: this.fullName
            },
            ...this.parentObject.transform()
        ]
    }
}



class CustomMetadataTypeObjectAdapter implements MetadataTypeAdapter{

    name:string;

    constructor(name: string){
        this.name = name;
    }

    public static isTypeOf(name: string): boolean{
        return name.endsWithIgnoreCase('__mdt');
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

        return (
            parts.length === 4 
            && 
            sobject.endsWithIgnoreCase('__mdt')
            &&
            mdType.toUpperCase() == '$CUSTOMMETADATA'
            
            );
    }

    public transform(): Metadata[]{

         //$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c
        let [mdType,sobject,sobjInstance,fieldName] = this.name.split('.');

        return [

            ...new FieldAdapter(sobject,fieldName).transform(),
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

export {FieldAdapter,RelationshipField,MetadataTypeAdapter,
    CustomLabelAdapter,CustomSettingAdapter,
    SObjectTypeAdapter,CustomMetadataTypeRecordAdapter}