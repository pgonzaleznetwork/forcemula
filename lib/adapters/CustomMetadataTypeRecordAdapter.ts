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