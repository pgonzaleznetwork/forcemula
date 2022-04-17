
<img src="./img/logo.png">

# Forcemula 
### Salesforce formula parsing simplified

<p align=center>

<img src="./coverage/badge-lines.svg">
<a href="https://github.com/pgonzaleznetwork/forcemula/actions/workflows/nodejs.yaml">
		<img src="https://github.com/pgonzaleznetwork/forcemula/workflows/Tests/badge.svg?style=flat" />
</a>
</p>

Parsing Salesforce formulas is easy if your formula looks like this

```
IF(ISPICKVAL(CustomerPriority__c,"High"),"Now","Later") 
```

But what if your formula looks like this?

```postgres 

IF(Owner.Contact.CreatedBy.Manager.Profile.Id = "03d3h000000khEQ",TRUE,false)

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

```

For this, you need `forcemula`

```javascript
{
        functions: [ 'IF', 'TRUE', 'FALSE', 'TEXT' ],
        operators: [ '=', '&', '|' ],
        standardFields: [
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
        ],
        standardObjects: [
          'OpportunityLineItem',
          'User',
          'Contact',
          'Profile',
          'Opportunity',
          'Account',
          'Organization'
        ],
        customMetadataTypeRecords: [
          'Trigger_Context_Status__mdt.by_handler',
          'Trigger_Context_Status__mdt.by_class'
        ],
        customMetadataTypes: [
          'Trigger_Context_Status__mdt',
          'SRM_API_Metadata_Client_Setting__mdt'
        ],
        customFields: [
          'Trigger_Context_Status__mdt.Enable_After_Insert__c',
          'OpportunityLineItem.Opportunity__c',
          'Opportunity__r.Related_Asset__c',
          'Center__c.My_text_field__c',
          'Customer_Support_Setting__c.Email_Address__c'
        ],
        customLabels: [ 'Details' ],
        unknownRelationships: [ 'Opportunity__r', 'Related_Asset__r' ],
        customObjects: [ 'Center__c' ],
        customSettings: [ 'Customer_Support_Setting__c' ]
      }
```
