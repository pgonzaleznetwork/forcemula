let parse = require('../src/index');

let simpleFormula = 'IF(ISBLANK("text"),true,false))';

let complexAccountFormula = `IF (AND (AnnualRevenue > 10000000, 
    CONTAINS (CASE (BillingCountry, "United States", "US", "America", "US", "USA", "US", "NA"), "US")), 
    IF(ISPICKVAL(Type, "Manufacturing Partner"), "Hot", 
    IF(OR (ISPICKVAL (Type, "Channel Partner/Reseller"), 
    IF(OR (ISPICKVAL (CustomerPriority__c, "High"),
    ISPICKVAL(Type, "Installation Partner")), "Warm", "Cold")), 
    "Cold")
    && TEXT(Tier__c) == "value"`

test('Simple formula: Functions are returned in functions[]',() =>{

    let result = parse(simpleFormula);

    expect(result.functions).toContain('ISBLANK');
    expect(result.functions).toContain('IF');

    expect(result.functions).not.toContain('text');
    expect(result.functions).not.toContain('true')
    expect(result.functions).not.toContain('false')
})

test('Complex formula: Functions are returned in functions[]',() =>{

    let result = parse(complexAccountFormula);

    expect(result.functions).toContain('IF');
    expect(result.functions).toContain('AND');
    expect(result.functions).toContain('CONTAINS');
    expect(result.functions).toContain('CASE');
    expect(result.functions).toContain('ISPICKVAL');
    expect(result.functions).toContain('OR');

    expect(result.functions).not.toContain('text');
    expect(result.functions).not.toContain('true')
    expect(result.functions).not.toContain('false')
})

test('Functions inside quotes should be ignored',() =>{

    let formula = 'IF(TRUE,"ISBLANK*CASE","Another value CONTAINS") && PRIORVALUE()'

    let result = parse(formula);

    expect(result.functions).toContain('IF');
    expect(result.functions).toContain('PRIORVALUE');

    expect(result.functions).not.toContain('ISBLANK');
    expect(result.functions).not.toContain('CASE');
    expect(result.functions).not.toContain('CONTAINS');
})

test('Standard fields should be captured',() =>{

    let result = parse(`IF(ISBLANK(BillingCountry),AnnualRevenue,Type) && CONTAINS(IsPICKVAL(custom__c))`);

    expect(result.standardFields.size).toBe(3);

    expect(result.standardFields).toContain('BillingCountry');
    expect(result.standardFields).toContain('AnnualRevenue');
    expect(result.standardFields).toContain('Type');
})

test('custom fields should be captured',() =>{

    let result = parse(complexAccountFormula);

    expect(result.customFields.size).toBe(2);

    expect(result.customFields).toContain('CustomerPriority__c');
    expect(result.customFields).toContain('Tier__c');
})

test('Escaped strings should behave like any other operator',() =>{

    let result = parse(`ISPICKVAL(CustomerPriority__c,\"High\") &&  ISBLANK(TEXT(Type))`);

    expect(result.customFields.size).toBe(1);
    expect(result.standardFields.size).toBe(1);

    expect(result.customFields).toContain('CustomerPriority__c');
    expect(result.standardFields).toContain('Type');
})


test('Only interesting operators should be captured',() =>{

    let result = parse(`ISPICKVAL(CustomerPriority__c,\"High\") &&  ISBLANK(TEXT(Type+Industry))`);
    
    expect(result.operators.size).toBe(2);

})