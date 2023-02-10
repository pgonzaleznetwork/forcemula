class Field{
    
    constructor(protected objectName: string, protected fieldName: string){
    }

    getApiName(): string{
        return `${this.objectName}.${this.fieldName}`;
    }

    getObjectName(): string{
        return this.objectName;
    }

    getFieldName(): string{
        return this.fieldName;
    }

    public resetApiName(newApiName: string): void{

        if(newApiName.includes('.')){
            const [newObjectName,newFieldName] = newApiName.split('.');
            this.objectName = newObjectName;
            this.fieldName = newFieldName;
        }
        else{
           throw Error('Api names must use dot notation')
        }
    }

}



export {Field}