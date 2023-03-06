let parse = require('../src/index');

test('An error should be thrown if any of the required parameters is missing', () => {

    let formula = `Name`

    expect(() => {
        parse({formula});
    }).toThrow('MISSING_PARAMETER');

    expect(() => {
        parse({parentObject:'Account'});
    }).toThrow('MISSING_PARAMETER');

})

test('Single-field formula: e2e test', () => {

    let formula = `Name`
    let result = parse({parentObject:'Account',formula});

    expect(Array.from(result.standardFields)).toEqual(expect.arrayContaining(['Account.Name'])); 

})

test('Comments should be ignored', () => {

    let formula = `/*ISBLANK(Name)*/ TEXT(Industry)`
    let result = parse({parentObject:'Account',formula});

    expect(Array.from(result.standardFields)).toEqual(expect.arrayContaining(['Account.Industry'])); 
    expect(Array.from(result.standardFields)).not.toEqual(expect.arrayContaining(['Account.Name'])); 

    expect(Array.from(result.functions)).toEqual(expect.arrayContaining(['TEXT'])); 
    expect(Array.from(result.functions)).not.toEqual(expect.arrayContaining(['ISBLANK'])); 

})



test('Standard formula: e2e test', () => {

    let formula = `IF(Owner.Contact.CreatedBy.Manager.Profile.Id = "03d3h000000khEQ",TRUE,false)

    &&
    
    IF(($CustomMetadata.Trigger_Context_Status__mdt.by_handler.Enable_After_Insert__c ||
    
      $CustomMetadata.Trigger_Context_Status__mdt.by_class.DeveloperName = "Default"),true,FALSE)
    
    &&
    
    IF( ($Label.Details = "Value" || Opportunity.Account.Parent.Parent.Parent.LastModifiedBy.Contact.AssistantName = "Marie"), true ,false)

    &&

    IF( (Opportunity__r.Related_Asset__r.Name), true ,false)
    
    && IF ( ( $ObjectType.Center__c.Fields.My_text_field__c = "My_Text_Field__c") ,true,false)
    
    && IF ( ( $ObjectType.SRM_API_Metadata_Client_Setting__mdt.Fields.CreatedDate  = "My_Text_Field__c") ,true,false)
    
    && IF ( ( TEXT($Organization.UiSkin) = "lex" ) ,true,false)
    
    && IF ( ( $Setup.Customer_Support_Setting__c.Email_Address__c = "test@gmail.com" ) ,true,false)
    
    && IF ( (  $User.CompanyName = "acme" ) ,true,false)`

    let result = parse({parentObject:'OpportunityLineItem',formula});

    console.log(result);

    let expectedFunctions = [
        'IF','TRUE','FALSE','TEXT'
    ].sort();

    const actualFunctions = Array.from(result.functions).sort();

    expect(actualFunctions).toEqual(expectedFunctions); 

    let expectedStandardFields = [
        'OpportunityLineItem.OwnerId',
        'User.ContactId',
        'Contact.CreatedById',
        'User.ManagerId',
        'User.ProfileId',
        'Profile.Id',
        'Trigger_Context_Status__mdt.DeveloperName',
        'OpportunityLineItem.OpportunityId',
        'Opportunity.AccountId',
        'Account.ParentId',
        'Account.LastModifiedById',
        'Contact.AssistantName',
        'Related_Asset__r.Name',
        'SRM_API_Metadata_Client_Setting__mdt.CreatedDate',
        'Organization.UiSkin',
        'User.CompanyName'
    ].sort();

    const actualStandardFields = Array.from(result.standardFields).sort();

    expect(actualStandardFields).toEqual(expectedStandardFields); 

    let expectedStandardObjects = [
        'OpportunityLineItem',
        'User',
        'Contact',
        'Profile',
        'Opportunity',
        'Account',
        'Organization'
    ].sort();

    const actualStandardObjects= Array.from(result.standardObjects).sort();

    expect(actualStandardObjects).toEqual(expectedStandardObjects); 

    let expectedCustomFields = [
        'Trigger_Context_Status__mdt.Enable_After_Insert__c',
        'OpportunityLineItem.Opportunity__c',
        'Opportunity__r.Related_Asset__c',
        'Center__c.My_text_field__c',
        'Customer_Support_Setting__c.Email_Address__c'
    ].sort();

    const actualCustomFields = Array.from(result.customFields).sort();

    expect(actualCustomFields).toEqual(expectedCustomFields); 

    let expectedcustomMetadataTypeRecords = [
        'Trigger_Context_Status__mdt.by_handler',
        'Trigger_Context_Status__mdt.by_class'
    ].sort();

    const actualCustomMetadataTypeRecords = Array.from(result.customMetadataTypeRecords).sort();

    expect(actualCustomMetadataTypeRecords).toEqual(expectedcustomMetadataTypeRecords); 

    let unexpectedcustomMetadataTypeRecords = [
        'SRM_API_Metadata_Client_Setting__mdt.Fields',
    ]

    expect(Array.from(result.customMetadataTypeRecords)).not.toEqual(expect.arrayContaining(unexpectedcustomMetadataTypeRecords));

    let expectedCustomMetadataTypes = [
        'Trigger_Context_Status__mdt',
        'SRM_API_Metadata_Client_Setting__mdt'
    ].sort();

    const actualCustomMetadataTypes = Array.from(result.customMetadataTypes).sort();

    expect(actualCustomMetadataTypes).toEqual(expectedCustomMetadataTypes);


    let expectedCustomLabels = [
        'Details'
    ]

    expect(Array.from(result.customLabels)).toEqual(expectedCustomLabels); 

    let expectedCustomSettings = [
        'Customer_Support_Setting__c'
    ]

    expect(Array.from(result.customSettings)).toEqual(expectedCustomSettings); 

    let expectedCustomObjects = ['Center__c'];

    expect(Array.from(result.customObjects)).toEqual(expect.arrayContaining(expectedCustomObjects)); 

    let expectedUnknownRelationships = [ 'Opportunity__r', 'Related_Asset__r' ];

    expect(Array.from(result.unknownRelationships)).toEqual(expectedUnknownRelationships); 


})



test('Process Builder formula: e2e test', () => {

    let formula = `IF([Account].Owner.Manager.Contact.Account.AccountNumber  = "text" ,TRUE,FALSE)

        ||

        IF([Account].original_lead__r.ConvertedAccountId != "",TRUE,FALSE)

        ||

        IF($CustomMetadata.Trigger_Context_Status__mdt.by_class.Enable_After_Delete__c , TRUE,FALse)`

    let result = parse({parentObject:'Account',formula});

    let expectedStandardFields = [
        'Account.OwnerId',
        'User.ManagerId',
        'User.ContactId',
        'Contact.AccountId',
        'Account.AccountNumber',
        'original_lead__r.ConvertedAccountId'
    ]

    expect(Array.from(result.standardFields)).toEqual(expect.arrayContaining(expectedStandardFields)); 

    let expectedCustomFields = [
        'Trigger_Context_Status__mdt.Enable_After_Delete__c',
        'Account.original_lead__c'
    ]

    expect(Array.from(result.customFields)).toEqual(expect.arrayContaining(expectedCustomFields)); 

    let expectedcustomMetadataTypeRecords = [
        'Trigger_Context_Status__mdt.by_class'
    ]

    expect(Array.from(result.customMetadataTypeRecords)).toEqual(expect.arrayContaining(expectedcustomMetadataTypeRecords)); 

})


test('CPQ Support for SBQQ__Quote__c', () => {

    let formula = `SBQQ__DistriBUtor__r.Name `
    let result = parse({parentObject:'SBQQ__QuoTE__c',formula});

    let expectedCustomFields = [
        'SBQQ__QuoTE__c.SBQQ__DistriBUtor__c'
    ]

    expect(Array.from(result.customFields)).toEqual(expect.arrayContaining(expectedCustomFields)); 

    let expectedStandardFields = [
        'Account.Name'
    ]

    expect(Array.from(result.standardFields)).toEqual(expect.arrayContaining(expectedStandardFields)); 

})


test('Unknown CPQ relationship should return the original name', () => {

    let formula = `SBQQ__random__r.Name `
    let result = parse({parentObject:'SBQQ__QuoTE__c',formula});

    let expectedCustomFields = [
        'SBQQ__QuoTE__c.SBQQ__random__c'
    ]

    expect(Array.from(result.customFields)).toEqual(expect.arrayContaining(expectedCustomFields)); 

    let expectedStandardFields = [
        'SBQQ__random__r.Name'
    ]

    expect(Array.from(result.standardFields)).toEqual(expect.arrayContaining(expectedStandardFields)); 

})

