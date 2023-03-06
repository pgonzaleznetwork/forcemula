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