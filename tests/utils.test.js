let {isOperator,isFunction, removeWhiteSpace, isCustomField} = require('../lib/utils');

test('* is an operator',() =>{
  expect(isOperator('*')).toBe(true);
})

test('ISBLANK is not an operator',() =>{
  expect(isOperator('ISBLANK')).toBe(false);
})

test('White space does not affect isOperator',() =>{
  expect(isOperator('* ')).toBe(true);
})

test('ISBLANK is a function',() =>{
  expect(isFunction('ISBLANK')).toBe(true);
})

test('Case does not affect isFunction',() =>{
  expect(isFunction('IsBLank')).toBe(true);
})

test('White space does not affect isFunction',() =>{
  expect(isFunction('IsBLank ')).toBe(true);
})

test('isFunction: undefined returns fallse',() =>{
  expect(isFunction(undefined)).toBe(false);
})

test('isFunction: Empty string returns false',() =>{
  expect(isFunction('')).toBe(false);
})

test('isFunction: null returns false',() =>{
  expect(isFunction(null)).toBe(false);
})


test('Removes white space',() =>{
  expect(removeWhiteSpace(' there is space ')).toBe('thereisspace');
})

test('Is custom field',() =>{
  expect(isCustomField('Account__c')).toBe(true);
})

