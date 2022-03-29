let parseField = require('../lib/parseFields');

/*test('Fields with relationships should be split by the dot separator',() =>{

    let result = parse({object:'Account',formula:`ISBLANK(Owner.Address) && original_lead__r.CleanStatus = "Clean" `});

    expect(result.standardFields).toContain('Account.OwnerId');
    expect(result.standardFields).toContain('User.Address');
    expect(result.customFields).toContain('Account.original_lead__c');

    expect(results.unknownRelationshipFields).toContain('Account.original_lead__c.CleanStatus')

})*/


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