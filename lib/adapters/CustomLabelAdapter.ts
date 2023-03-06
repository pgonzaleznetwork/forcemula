//TO DO: HOW TO CREATE GLOBAL TYPES SO I dont need to import them
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
