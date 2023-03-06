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