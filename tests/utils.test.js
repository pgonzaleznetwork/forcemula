let _ = require('../lib/utils');
let ValueType = require('../lib/ValueTypes');


test('* is an operator',() =>{
  expect(_.isOperator('*')).toBe(true);
})

test('ISBLANK is not an operator',() =>{
  expect(_.isOperator('ISBLANK')).toBe(false);
})

test('White space does not affect isOperator',() =>{
  expect(_.isOperator('* ')).toBe(true);
})

test('ISBLANK is a function',() =>{
  expect(_.isFunction('ISBLANK')).toBe(true);
})

test('Case does not affect isFunction',() =>{
  expect(_.isFunction('IsBLank')).toBe(true);
})

test('White space does not affect isFunction',() =>{
  expect(_.isFunction('IsBLank ')).toBe(true);
})

test('isFunction: undefined returns fallse',() =>{
  expect(_.isFunction(undefined)).toBe(false);
})

test('isFunction: Empty string returns false',() =>{
  expect(_.isFunction('')).toBe(false);
})

test('isFunction: null returns false',() =>{
  expect(_.isFunction(null)).toBe(false);
})


test('Removes white space',() =>{
  expect(_.removeWhiteSpace(' there is space ')).toBe('thereisspace');
})

test('Is custom field',() =>{
  expect(_.isCustomField('Account__c')).toBe(true);
  expect(_.isCustomField('AccountId')).toBe(false);
})

test('Parse custom field',() =>{

  let value = _.parseCustomField(`My_text_field__c`,'Account');

  expect(value).toHaveProperty('instance','Account.My_text_field__c')
  expect(value).toHaveProperty('type',ValueType.CUSTOM_FIELD);

  
})

test('Parse standard field',() =>{

  let value = _.parseStandardField(`Industry`,'Account');

  expect(value).toHaveProperty('instance','Account.Industry')
  expect(value).toHaveProperty('type',ValueType.STANDARD_FIELD);
})



test('Interesting operators',() =>{

  expect(_.isInterestingOperator('*')).toBe(true);
  expect(_.isInterestingOperator(',')).toBe(false);
  expect(_.isInterestingOperator('(')).toBe(false);

})

test('Is standard relationship',() =>{

  expect(_.isStandardRelationship('Account')).toBe(true);
  expect(_.isStandardRelationship('Account__r')).toBe(false);

})

test('Is user field', () => {

  expect(_.isUserField('Owner.FirstName')).toBe(true);
  expect(_.isUserField('Manager.FirstName')).toBe(true);
  expect(_.isUserField('CreatedBy.FirstName')).toBe(true);
  expect(_.isUserField('LastModifiedBY.FirstName')).toBe(true);

})

test('Transform to User field', () => {

  expect(_.transformToUserField('Owner.FirstName')).toBe('User.FirstName');
  expect(_.transformToUserField('Manager.FirstName')).toBe('User.FirstName');
  expect(_.transformToUserField('CreatedBy.FirstName')).toBe('User.FirstName');
  expect(_.transformToUserField('LastModifiedBY.area__c')).toBe('User.area__c');

})

test('Transform to Id', () => {
  expect(_.transformToId('Owner.Manager')).toBe('Owner.ManagerId');
})

test('Transform to field name', () => {
  expect(_.transformToFieldName('Owner.custom__r')).toBe('Owner.custom__c');
})

test('Is custom metadata', () => {
  expect(_.isCustomMetadata(`$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c`)).toBe(true);
})

test('Parse custom metadata field', () => {

  let field = '$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c';
  let value = _.parseCustomMetadata(field)

  expect(value.length).toBe(2);

  value.forEach(val => {

    if(val.type == ValueType.CUSTOM_FIELD){
      expect(val.instance).toBe('Trigger_Context_Status__mdt.Enable_After_Insert__c')
    }

    if(val.type == ValueType.CUSTOM_METADATA_TYPE){
      expect(val.instance).toBe('Trigger_Context_Status__mdt.SRM_Metadata_c')
    }

  })    
})

test('Is custom label', () => {
  expect(_.isCustomLabel(`$Label.SomeName`)).toBe(true);
})


test('Parse custom label', () => {

  let value = _.parseCustomLabel(`$Label.SomeName`);

  expect(value).toHaveProperty('instance','SomeName')
  expect(value).toHaveProperty('type',ValueType.CUSTOM_LABEL);
})

test('Is custom setting', () => {
  expect(_.isCustomSetting(`$Setup.SomeName`)).toBe(true);
})

test('Parse custom setting', () => {

  let value = _.parseCustomSetting(`$Label.SomeName`);

  expect(value).toHaveProperty('instance','SomeName')
  expect(value).toHaveProperty('type',ValueType.CUSTOM_SETTING);
})

test('Is object type', () => {
  expect(_.isObjectType(`$ObjectType.Center__c.Fields.My_text_field__c`)).toBe(true);
})

test('Parse object type', () => {

  let value = _.parseObjectType(`$ObjectType.Center__c.Fields.My_text_field__c`);

  expect(value).toHaveProperty('instance','Center__c.My_text_field__c')
  expect(value).toHaveProperty('type',ValueType.CUSTOM_FIELD);
})

test('Is relationship field' ,() => {

  expect(_.isRelationshipField('Account.Name')).toBe(true);
  expect(_.isRelationshipField('Name')).toBe(false);

})

test('Remove prefix' ,() => {

  expect(_.removePrefix('$Organization.Name')).toBe('Organization.Name');
  expect(_.removePrefix('User.RoleId')).toBe('User.RoleId');

})

test('Is special prefix' ,() => {

  expect(_.isSpecialPrefix('Organization')).toBe(true);
  expect(_.isSpecialPrefix('ObjectType')).toBe(false);

})


