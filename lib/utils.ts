
const upper = value => value.toUpperCase();
const parts = value => value.split('.');
const getObject = value => parts(value)[0];
const getField = value => parts(value)[1];
const removeWhiteSpace = value => value.replace(/\s/g,'');


module.exports = {upper,parts,getObject,getField,removeWhiteSpace}