interface Metadata{
    //refactor to enum
    type: InstanceType<typeof MetadataType>;
    instance: string;
}


interface MetadataTypeAdapter{
    isTypeOf?(name: string):boolean;
    transform():Metadata[]
}

module.exports = {Metadata,MetadataTypeAdapter}