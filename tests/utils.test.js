let _ = require('../lib/utils');
let ValueType = require('../lib/ValueTypes');


test('The * should be considered an operator',() =>{
  expect(_.isOperator('*')).toBe(true);
})

test('The word ISBLANK should not be an operator',() =>{
  expect(_.isOperator('ISBLANK')).toBe(false);
})

test('Operators should be identified even if there is white space around them',() =>{
  expect(_.isOperator('* ')).toBe(true);
})

test('The word ISBLANK should be considered a function',() =>{
  expect(_.isFunction('ISBLANK')).toBe(true);
})

test('The case (upper or lower) of a function should not affect its determination',() =>{
  expect(_.isFunction('IsBLank')).toBe(true);
})

test('Functions should be identified even if theres white space around them',() =>{
  expect(_.isFunction('IsBLank ')).toBe(true);
})

test('The "isFunction" function should return false on falsy values',() =>{
  expect(_.isFunction(undefined)).toBe(false);
  expect(_.isFunction('')).toBe(false);
  expect(_.isFunction(null)).toBe(false);
})


test('White space should be removed',() =>{
  expect(_.removeWhiteSpace(' there is space ')).toBe('thereisspace');
})

test('Whether a field is custom or standard is determined by whether the field ends with __c, irrespective of the case',() =>{
  expect(_.isCustom('Account__C')).toBe(true);
  expect(_.isCustom('AccountId')).toBe(false);
})

test('Custom fields should be returned with their original object as a prefix, and the correct ValueType',() =>{

  let value = _.parseField(`My_text_field__c`,'Account');

  expect(value).toHaveProperty('instance','Account.My_text_field__c')
  expect(value).toHaveProperty('type',ValueType.CUSTOM_FIELD);

  
})

test('Standard fields should be returned with their original object as a prefix, and the correct ValueType',() =>{

  let value = _.parseField(`Industry`,'Account');

  expect(value).toHaveProperty('instance','Account.Industry')
  expect(value).toHaveProperty('type',ValueType.STANDARD_FIELD);
})



test('Only certain operators should be considered "interesting" ',() =>{

  expect(_.isInterestingOperator('*')).toBe(true);
  expect(_.isInterestingOperator(',')).toBe(false);
  expect(_.isInterestingOperator('(')).toBe(false);

})

test('If a field does not end with __r, it should be considered a standard relationship',() =>{

  expect(_.isStandardRelationship('Account')).toBe(true);
  expect(_.isStandardRelationship('Account__r')).toBe(false);
  expect(_.isStandardRelationship('Lead__R')).toBe(false);

})

test('Certain fields (such as Owner, CreatedBy, etc.) should be considered User fields', () => {

  expect(_.isUserField('Owner.FirstName')).toBe(true);
  expect(_.isUserField('Manager.FirstName')).toBe(true);
  expect(_.isUserField('CreatedBy.FirstName')).toBe(true);
  expect(_.isUserField('LastModifiedBY.FirstName')).toBe(true);
  //upper case
  expect(_.isUserField('OWNER.FirstName')).toBe(true);
  expect(_.isUserField('MANAger.FirstName')).toBe(true);
  expect(_.isUserField('CREATEDBy.FirstName')).toBe(true);
  expect(_.isUserField('lastmodifiEDBY.FirstName')).toBe(true);

})

test('User fields should be transformed to their original API name', () => {

  expect(_.transformToUserField('Owner.FirstName')).toBe('User.FirstName');
  expect(_.transformToUserField('Manager.FirstName')).toBe('User.FirstName');
  expect(_.transformToUserField('CreatedBy.FirstName')).toBe('User.FirstName');
  expect(_.transformToUserField('LastModifiedBY.area__c')).toBe('User.area__c');

})

test('The "transformToId" function should add "Id" at the end of the field name', () => {
  expect(_.transformToId('Owner.Manager')).toBe('Owner.ManagerId');
})

test('The "replaceRwithC" function should replace __r with __c', () => {
  expect(_.replaceRwithC('Owner.custom__r')).toBe('Owner.custom__c');
  //upper case
  expect(_.replaceRwithC('Owner.custom__R')).toBe('Owner.custom__c');
})

test('Custom Metadata is determined by the presence of the word __MDT anywhere in the field name', () => {
  expect(_.isCustomMetadata(`$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c`)).toBe(true);
  //upper case
  expect(_.isCustomMetadata(`$CustomMetadata.Trigger_Context_Status__mDT.SRM_Metadata_c.Enable_After_Insert__c`)).toBe(true);
})

test('Custom Metadata should be converted to both custom fields and metadata types', () => {

  let field = '$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c';
  let value = _.parseCustomMetadata(field)

  expect(value.length).toBe(3);

  value.forEach(val => {

    if(val.type == ValueType.CUSTOM_FIELD){
      expect(val.instance).toBe('Trigger_Context_Status__mdt.Enable_After_Insert__c')
    }

    if(val.type == ValueType.CUSTOM_METADATA_TYPE_RECORD){
      expect(val.instance).toBe('Trigger_Context_Status__mdt.SRM_Metadata_c')
    }

    if(val.type == ValueType.CUSTOM_METADATA_TYPE){
      expect(val.instance).toBe('Trigger_Context_Status__mdt')
    }

  })    
})

test('Custom Labels are determined by the $Label prefix', () => {
  expect(_.isCustomLabel(`$Label.SomeName`)).toBe(true);
  //upper case
  expect(_.isCustomLabel(`$LaBEL.SomeName`)).toBe(true);
})


test('Custom Labels should be parsed by removing the $Label prefix and adding the correct ValueType', () => {

  let value = _.parseCustomLabel(`$Label.SomeName`);

  expect(value).toHaveProperty('instance','SomeName')
  expect(value).toHaveProperty('type',ValueType.CUSTOM_LABEL);
})


test('Custom Settings are determined by the $Setup prefix', () => {
  expect(_.isCustomSetting(`$Setup.SomeName`)).toBe(true);
  //upper case
  expect(_.isCustomSetting(`$SeTUP.SomeName`)).toBe(true);
})

test('Custom Settings should be parsed by removing the $Setting prefix and adding the correct ValueType', () => {

  let types = _.parseCustomSetting(`$Setup.My_Setting__c.my_field__c`);

  let expected = [
    {
        type : ValueType.CUSTOM_FIELD,
        instance:'My_Setting__c.my_field__c'
    },
    {
        type : ValueType.CUSTOM_SETTING,
        instance:'My_Setting__c'
    }
  ]

  expect(types).toEqual(expect.arrayContaining(expected));

})

test('Object Types are determined by the $ObjectType prefix', () => {
  expect(_.isObjectType(`$ObjectType.Center__c.Fields.My_text_field__c`)).toBe(true);
  //upper case
  expect(_.isObjectType(`$ObjectTYPE.Center__c.Fields.My_text_field__c`)).toBe(true);
})

test('Object Types are parsed by removing the unnecessary prefixes and returning the field API name', () => {

  let types = _.parseObjectType(`$ObjectType.Center__c.Fields.My_text_field__c`);

  let expected = [
    {
      instance:'Center__c.My_text_field__c',
      type:ValueType.CUSTOM_FIELD
    },
    {
      instance:'Center__c',
      type:ValueType.CUSTOM_OBJECT
    }
  ]

  expect(types).toEqual(expect.arrayContaining(expected));

 
})

test('A field is considered a relationship field if there is a dot in between' ,() => {

  expect(_.isRelationshipField('Account.Name')).toBe(true);
  expect(_.isRelationshipField('Name')).toBe(false);

})

test('The "removePrefix" function should remove the $ character' ,() => {

  expect(_.removePrefix('$Organization.Name')).toBe('Organization.Name');
  expect(_.removePrefix('User.RoleId')).toBe('User.RoleId');

})

test('Certain prefixes should be considered of a special type' ,() => {

  expect(_.isSpecialPrefix('$Organization')).toBe(true);
  expect(_.isSpecialPrefix('$PROfile')).toBe(true);
  expect(_.isSpecialPrefix('$ObjectType')).toBe(false);

})

test('If a field ends in ParentId, it should be considered a parent field' ,() => {

  expect(_.isParentField('Account.Parent')).toBe(false);
  expect(_.isParentField('Account.parEnTid')).toBe(true);

})

test('The word "parent" in a custom field should determine that this is a parent relationship' ,() => {

  expect(_.isParent('ParentId')).toBe(false);
  expect(_.isParent('Parent')).toBe(true);

})

test('Parse object should determine if the object is standard or custom' ,() => {

  let result = _.parseObject('Account');

  let expected = {
    instance:'Account',
    type:ValueType.STANDARD_OBJECT
  }

  expect(result).toEqual(expected);

  result = _.parseObject('Account__c');

  expected = {
    instance:'Account__c',
    type:ValueType.CUSTOM_OBJECT
  }

  expect(result).toEqual(expected);

})

