let parseField = require('../lib/parseFields');


test('Single fields are returned as is',() =>{

    let fields = parseField('Account.Name');

    expect(fields).toContain('Account.Name')
    expect(fields.size).toBe(1);
  
})

test('Standard relationships are converted to their relationship name',() =>{

    let fields = parseField('Account.Opportunity.Name');

    expect(fields).toContain('Account.OpportunityId')
    expect(fields).toContain('Opportunity.Name')
    expect(fields.size).toBe(2);
  
})

test('Custom relationships are converted to their custom field name',() =>{

    let fields = parseField('Account.Opportunity__r.Name');

    expect(fields).toContain('Account.Opportunity__c')
    expect(fields).toContain('Opportunity__r.Name')
    expect(fields.size).toBe(2);
  
})

test('Mix of custom and standard relationships',() =>{

    let fields = parseField('Account.Opportunity__r.Asset.Contact.FirstName');

    expect(fields).toContain('Account.Opportunity__c')
    expect(fields).toContain('Opportunity__r.AssetId')
    expect(fields).toContain('Asset.ContactId')
    expect(fields).toContain('Contact.FirstName')
    expect(fields.size).toBe(4);
  
})

test('All relationship fields',() =>{

    let fields = parseField('Account.first__r.second__r.third__r.fourth__r.FirstName');

    expect(fields).toContain('Account.first__c')
    expect(fields).toContain('first__r.second__c')
    expect(fields).toContain('second__r.third__c')
    expect(fields).toContain('third__r.fourth__c')
    expect(fields).toContain('fourth__r.FirstName')
    expect(fields.size).toBe(5);
  
})


test('User-related fields are transformed to User.[field]', () => {

    let fields = parseField('Account.Owner.Contact.Account.LastModifiedBy.Department');

    expect(fields).toContain('Account.OwnerId')
    expect(fields).toContain('User.ContactId')
    expect(fields).toContain('Contact.AccountId')
    expect(fields).toContain('Account.LastModifiedById')
    expect(fields).toContain('User.Department')

})

test('Custom metadata fields are parsed correctly', () => {

    let fields = parseField('$CustomMetadata.Trigger_Context_Status__mdt.SRM_Metadata_c.Enable_After_Insert__c');

    expect(fields).toContain('Trigger_Context_Status__mdt.Enable_After_Insert__c');
    expect(fields.size).toBe(1);        

})

