let _ = require('../lib/utils');

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