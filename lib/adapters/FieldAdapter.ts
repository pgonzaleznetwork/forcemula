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
