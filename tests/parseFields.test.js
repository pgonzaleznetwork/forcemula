let parseType = require('../lib/parseTypes');
const ValueType = require('../lib/ValueTypes');
let originalObject = 'Account';


test('Passing a single STANDARD field name should return the same field, but with the original object as a prefix',() =>{

    let types = parseType('Name',originalObject);

    let expected = [
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Account.Name'
        },
    ]

    expect(types).toEqual(expect.arrayContaining(expected));  
})

test('Passing a single CUSTOM field name should return the same field, but with the original object as a prefix',() =>{

    let types = parseType('custom__C',originalObject);

    let expected = [
        {
            type : ValueType.CUSTOM_FIELD,
            instance:'Account.custom__C'
        },
    ]

    expect(types).toEqual(expect.arrayContaining(expected));  
})



test('Standard self-referential relationships should be converted back to their original type',() =>{

    let types = parseType(
        'Opportunity.Account.Parent.Parent.Parent.Parent.pareNt.AccountNumber',
        'OpportunityLineItem'
    );

    let expected = [
        {
            type : ValueType.STANDARD_FIELD,
            instance:'OpportunityLineItem.OpportunityId'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Opportunity.AccountId'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Account.ParentId'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Account.AccountNumber'
        }
    ]

    expect(types).toEqual(expect.arrayContaining(expected));  
})



test('STANDARD relationships should be converted to their original field name',() =>{

    let types = parseType('Account.Opportunity.Custom__c','Contact');

    let expected = [
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Contact.AccountId'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Account.OpportunityId'
        },
        {
            type : ValueType.CUSTOM_FIELD,
            instance:'Opportunity.Custom__c'
        }
    ]

    expect(types).toEqual(expect.arrayContaining(expected)); 
  
})


test('CUSTOM relationships should be converted to their original field name',() =>{

    let types = parseType('Account.Opportunity__r.Name','Contact');

    let expected = [
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Contact.AccountId'
        },
        {
            type : ValueType.CUSTOM_FIELD,
            instance:'Account.Opportunity__c'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Opportunity__r.Name'
        }
    ]

    expect(types).toEqual(expect.arrayContaining(expected)); 
  
})


test('A mix of custom and standard relationships should result in the same conversation seen in the previous 2 tests',() =>{

    let types = parseType('Account.Opportunity__r.Asset.Contact.FirstName','Lead');

    let expected = [
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Lead.AccountId'
        },
        {
            type : ValueType.CUSTOM_FIELD,
            instance:'Account.Opportunity__c'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Opportunity__r.AssetId'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Asset.ContactId'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Contact.FirstName'
        }
    ]

    expect(types).toEqual(expect.arrayContaining(expected)); 
  
})



test('A chain of custom relationships should be supported',() =>{

    let types = parseType('Account.first__r.second__r.third__r.fourth__r.FirstName','Order');

    let expected = [
        {
            type : ValueType.STANDARD_FIELD,
            instance:'Order.AccountId'
        },
        {
            type : ValueType.CUSTOM_FIELD,
            instance:'Account.first__c'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'first__r.second__c'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'second__r.third__c'
        },
        {
            type : ValueType.STANDARD_FIELD,
            instance:'third__r.fourth__c'
        }
        ,
        {
            type : ValueType.STANDARD_FIELD,
            instance:'third__r.fourth__c'
        }
    ]

    expect(types).toEqual(expect.arrayContaining(expected)); 

    expect(fields).toContain('Account.first__c')
    expect(fields).toContain('first__r.second__c')
    expect(fields).toContain('second__r.third__c')
    expect(fields).toContain('third__r.fourth__c')
    expect(fields).toContain('fourth__r.FirstName')
    expect(fields.size).toBe(5);
  
})

/*


test('User-related fields are transformed to User.[field]', () => {

    let fields = parseType('Account.Owner.Contact.Account.LastModifiedBy.Department');

    expect(fields).toContain('Account.OwnerId')
    expect(fields).toContain('User.ContactId')
    expect(fields).toContain('Contact.AccountId')
    expect(fields).toContain('Account.LastModifiedById')
    expect(fields).toContain('User.Department')

})

test('Custom metadata fields are parsed correctly', () => {

    let fields = parseType('$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c');

    expect(fields).toContain('Trigger_Context_Status__mdt.Enable_After_Insert__c');
    expect(fields.size).toBe(1);        

})

test('Custom setting fields are parsed correctly', () => {

    let fields = parseType('$Setup.Customer_Support_Setting__c.Email_Address__c');

    expect(fields).toContain('$Setup.Customer_Support_Setting__c.Email_Address__c');
    expect(fields.size).toBe(1);        

})

test('The $ prefix is removed from special objects like $User, $Profile, $Organization, etc', () => {

    let fields = parseType('$User.Manager.ProfileId');

    expect(fields).toContain('User.ManagerId');
    expect(fields).toContain('User.ProfileId');
    expect(fields.size).toBe(2);        

})

*/



