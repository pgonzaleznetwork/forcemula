
const upper = (value: string): string => value.toUpperCase();
const parts = (value: string): string[] => value.split('.');
const getObject = (value: string): string => parts(value)[0];
const getField = (value: string): string => parts(value)[1];
const removeWhiteSpace = (value: string): string => value.replace(/\s/g,'');

String.prototype.startsWithIgnoreCase = function(input: string): boolean{
    return this.toUpperCase().startsWith(input);
}

String.prototype.endsWithIgnoreCase = function(input: string): boolean{
    return this.toUpperCase().endsWith(input);
}

module.exports = {upper,parts,getObject,getField,removeWhiteSpace}