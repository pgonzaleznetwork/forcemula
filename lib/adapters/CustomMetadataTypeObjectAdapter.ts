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