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