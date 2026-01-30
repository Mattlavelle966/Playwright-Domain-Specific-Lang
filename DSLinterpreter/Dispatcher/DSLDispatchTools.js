const { expect } = require('@playwright/test');

async function checkId(Id, page) {
  try {
    let locator;

    // If it's an id with a comma, use attribute selector or escape the comma
    if (Id.startsWith('#') && Id.includes(',')) {
      const idValue = Id.slice(1); // drop leading '#'
      locator = page.locator(`[id="${idValue}"]`).first();
    } else if (Id.startsWith('#')) {
      locator = page.locator(Id).first(); // normal CSS id
    } else {
      // Not starting with '#': still allow exact id with comma via attribute
      locator = page.locator(`[id="${Id}"]`).first();
    }

    await locator.waitFor({ state: 'visible', timeout: 12000 });
    return [true, locator];
  } catch (err) {
    console.error(`checkId failed for "${Id}": ${err?.message || err}`);
    return [false, undefined];
  }
}
async function checkIdNonVisible(Id, page) {
  try {
    let locator;

    // If it's an id with a comma, use attribute selector or escape the comma
    if (Id.startsWith('#') && Id.includes(',')) {
      const idValue = Id.slice(1); // drop leading '#'
      locator = page.locator(`[id="${idValue}"]`).first();
    } else if (Id.startsWith('#')) {
      locator = page.locator(Id).first(); // normal CSS id
    } else {
      // Not starting with '#': still allow exact id with comma via attribute
      locator = page.locator(`[id="${Id}"]`).first();
    }

    return [true, locator];
  } catch (err) {
    console.error(`checkId failed for "${Id}": ${err?.message || err}`);
    return [false, undefined];
  }
}
async function checkLiteralId(Id, page) {
  try {
    let locator;

    // If it's an id with a comma, use attribute selector or escape the comma
    if (Id.startsWith('#') && Id.includes(',')) {
      const idValue = Id.slice(1); // drop leading '#'
      locator = page.locator(`${idValue}`).first();
    } else if (Id.startsWith('#')) {
      locator = page.locator(Id).first(); // normal CSS id
    } else {
      // Not starting with '#': still allow exact id with comma via attribute
      locator = page.locator(`${Id}`).first();
    }

    return [true, locator];
  } catch (err) {
    console.error(`checkId failed for "${Id}": ${err?.message || err}`);
    return [false, undefined];
  }
}

function passParser(value){
    if (value.startsWith('pass+')) {
        let finder = value.split('+')[1]; // Get the part after 'pass+'
        let key = finder.split('*')[0]; // Get the header name
        let str = finder.split('*')[1];
        return passDataFinder(key, str);
    }
    return value;
}
function grabParser(value,pack,index){
    if (value.startsWith('grab+')) {
        return grabDataFinder(value.split('+')[1],pack,index); // Get the part after 'pass+');

    }
    return value;
}
function grabSetParser(value,pack,index){
    if (value.startsWith('grabset+')) {
        return grabSetDataFinder(value.split('+')[1],pack,index); // Get the part after 'pass+');

    }
    return value;
}
function optionParser(value){
    if (value.startsWith('option+')) {
        let finder = value.split('+')[1]; // Get the part after 'pass+'
        return finder;
    }
    return value;
}
//REF bug #10
function grabSetDataFinder(header,pack,index){
    //use the test name to find a "call"
    const rows = Object.keys(dispatch);
    const TestCaseNames = Object.keys(pack.DispatchPackets);
    const TestCaseName = TestCaseNames[index];
    const testLogic = pack.DispatchPackets[TestCaseName];
    
    console.log("index:"+index);
    console.log("Searching for grab data for Test Case Name:"+TestCaseName);
    console.log(TestCaseName);
    console.log(rows);
    //should look for row that name was defined in and grab associated inputs
    for(let i=0;i<rows.length;i++){
        let currentDispatch = dispatch[rows[i]];
        const rowKeys = Object.keys(currentDispatch);
        for(let j=0;j<rowKeys.length;j++){

            const value = String(currentDispatch[rowKeys[j]]);
            console.log(`value:${value} == name=${TestCaseName}`);
            if(Number.isInteger(value)) continue;
            if(value == null) continue;
            if(value.includes(`name=${TestCaseName}`)){
                //found the current tests declaration row
                for(let k=0;k<rowKeys.length;k++){
                //now look for the call statement under that name
                    const innerValue = currentDispatch[rowKeys[k]];
                    if(Number.isInteger(innerValue)) continue;
                    if(innerValue == null) continue;
                    if(innerValue.includes(`call=`)){
                        //find the name refrenced in this tests call statement
                        const foundKey = innerValue.match(/call=[^;]*/);
                        if(foundKey == null) continue;
                        console.log(foundKey);
                        const nameKey = foundKey[0].split('=')[1];
                        console.log(`setfoundKey:${nameKey}`);
                        //then look for that name in the dispatch to find the associated data
                        //then return the data associated with the header 
                        return findSetRowValue(nameKey,header,pack);
                    }
                }
            }
        }
    }
    return "Failed to find grabset data GrabSetDataFinder";
}

function findSetRowValue(name,header,pack){
     //should grab the current test name from the pack using the index
    //use the test name to find a "call"
    const rows = Object.keys(dispatch)
    const TestCaseNames = Object.keys(pack.DispatchPackets);

    for(let i=0;i<rows.length;i++){
        let currentDispatch = dispatch[rows[i]]
        const rowKeys = Object.keys(currentDispatch)
        for(let j=0;j<rowKeys.length;j++){
            const innerValue = currentDispatch[rowKeys[j]];
            if(Number.isInteger(innerValue)) continue;
            if(innerValue == null) continue;
            if(innerValue.includes(`name=${name}`)){
                const foundKey = innerValue.match(/name=[^;]*/);
                if(foundKey == null) continue;
                console.log(foundKey);
                const nameKey = foundKey[0].split('=')[1];
                console.log(`findSetfoundKey:${nameKey}`);
                if(nameKey.toLowerCase == name.toLowerCase){
                    return currentDispatch[header];
                }
                
            }
        }
    }
    return "Failed to find grab data FindSetRowValue";
}


function grabDataFinder(header,pack,index){
    //should grab the current test name from the pack using the index
    //use the test name to find a "call"
    const rows = Object.keys(dispatch)
    const TestCaseNames = Object.keys(pack.DispatchPackets);
    const TestCaseName = TestCaseNames[index];
    console.log("index:"+index);
    console.log("Searching for grab data for Test Case Name:"+TestCaseName);
    const testLogic = pack.DispatchPackets[TestCaseName];
    console.log(TestCaseName);
    console.log(rows);
    //should look for row that name was defined in and grab associated inputs
    for(let i=0;i<rows.length;i++){
        let currentDispatch = dispatch[rows[i]]
        const rowKeys = Object.keys(currentDispatch)
        for(let j=0;j<rowKeys.length;j++){

            const value = String(currentDispatch[rowKeys[j]]);
            if(Number.isInteger(value)) continue;
            if(value == null) continue;
            if(value.includes(`name=${TestCaseName}`)){
                console.log(`value:${value}`);
                const foundKey = value.split('=')[1];
                console.log(`foundKey:${foundKey}`);
                if(currentDispatch[rowKeys[j]] != null && foundKey.toLowerCase == TestCaseName.toLowerCase){
                    //found the row the test name was defined in
                    console.log(`looking for:${TestCaseName} | Found:${foundKey}`);
                    console.log(currentDispatch);
                    console.log(currentDispatch[header]);
                    return String(currentDispatch[header]);

                }
            }
        }
    }
    return "Failed to find grab data, grabDataFinder";
}




function passDataFinder(header,str){
    const rows = Object.keys(dispatch)
    for(let i=0;i<rows.length;i++){
        let currentDispatch = dispatch[rows[i]]
        if(currentDispatch[header] != null && currentDispatch[header] == str){
            return currentDispatch[header];
        }
    }
    return null;
}

function caseNameFinder(pack,index){
    const TestCaseNames = Object.keys(pack.DispatchPackets);
    return TestCaseNames[index];
}
async function assertionsTC18(page) {
    let result = "";
    try{
        await expect(page.locator('app-requestor-review')).toContainText('Manufacturer Information');
        await expect(page.getByLabel('Vendor Details')).toContainText('Vendor Details');
        await expect(page.getByLabel('Vendor Details').locator('app-organization-search-result')).toContainText('Prod Like Third Party');
        await expect(page.getByLabel('Vendor Details').locator('app-organization-search-result')).toContainText('Address');
        await expect(page.getByLabel('Vendor Details').locator('app-organization-search-result')).toContainText('Toronto, ON, Canada');
        await expect(page.getByLabel('Melange 500mg, Category').getByLabel('Manufacturer Details')).toContainText('Manufacturer Details');
        await expect(page.locator('app-requestor-review')).toContainText('20250527.141655');
        await expect(page.locator('app-requestor-review')).toContainText('Address');
        await expect(page.locator('app-requestor-review')).toContainText('20250527.141706, 20250527.141707');
        await expect(page.locator('app-requestor-review')).toContainText('Business Arrangement Letters');
        await expect(page.locator('app-requestor-review')).toContainText('testpdf6.pdf');
        await expect(page.locator('app-requestor-review')).toContainText('Primary Contact Information');
        await expect(page.locator('app-requestor-review')).toContainText('Select where the Primary Contact is from');
        await expect(page.locator('app-requestor-review')).toContainText('Vendor');
        await expect(page.locator('app-requestor-review')).toContainText('Select a Primary Contact for Submission');
        await expect(page.locator('app-requestor-review')).toContainText('Prod Like Third Party, Matt');
        await expect(page.locator('app-requestor-review')).toContainText('Prod Like Third Party');
        await expect(page.locator('app-requestor-review')).toContainText('Job Title');
        await expect(page.locator('app-requestor-review')).toContainText('QA');
        await expect(page.locator('app-requestor-review')).toContainText('Email');
        await expect(page.locator('app-requestor-review')).toContainText('20251106.101322256@havenhomes.ca');
        await expect(page.getByLabel('Product Information')).toContainText('Product Details');
        await expect(page.getByLabel('Product Information')).toContainText('Product Name');
        await expect(page.getByLabel('Product Information')).toContainText('Melange');
        await expect(page.getByLabel('Product Information')).toContainText('Active Ingredient(s)');
        await expect(page.getByLabel('Product Information')).toContainText('SPICE');
        await expect(page.getByLabel('Product Information')).toContainText('Identifier Type');
        await expect(page.getByLabel('Product Information')).toContainText('Drug Identification Number');
        await expect(page.getByLabel('Product Information')).toContainText('Identifier');
        await expect(page.getByLabel('Product Information')).toContainText('12345678');
        await expect(page.getByLabel('Product Information')).toContainText('Dosage Form');
        await expect(page.getByLabel('Product Information')).toContainText('Aerosol');
        await expect(page.getByLabel('Product Information')).toContainText('Strength');
        await expect(page.getByLabel('Product Information')).toContainText('500mg');
        await expect(page.getByLabel('Product Information').getByLabel('Route of Administration')).toContainText('Route of Administration');
        await expect(page.getByLabel('Product Information').getByLabel('Route of Administration')).toContainText('Route of Administration');
        await expect(page.getByLabel('Product Information').getByLabel('Route of Administration')).toContainText('Block/Infiltration');
        await expect(page.getByLabel('Product Information').getByLabel('Product Classification')).toContainText('Product Classification');
        await expect(page.getByLabel('Product Information').getByLabel('Product Classification')).toContainText('Biologic');
        await expect(page.getByLabel('Product Information').getByLabel('Product Classification')).toContainText('No');
        await expect(page.getByLabel('Product Information').getByLabel('Product Classification')).toContainText('Oncology');
        await expect(page.getByLabel('Product Information').getByLabel('Product Classification')).toContainText('No');
        await expect(page.getByLabel('Product Information')).toContainText('Packaging and Pricing');
        await expect(page.getByLabel('Product Information').getByLabel('Packaging and Pricing')).toContainText('Package Type');
        await expect(page.getByLabel('Product Information').getByLabel('Packaging and Pricing')).toContainText('Autoinjector, single-dose');
        await expect(page.getByLabel('Product Information').getByLabel('Packaging and Pricing')).toContainText('Package Size');
        await expect(page.getByLabel('Product Information').getByLabel('Packaging and Pricing')).toContainText('5');
        await expect(page.getByLabel('Pricing', { exact: true })).toContainText('Price Type');
        await expect(page.getByLabel('Pricing', { exact: true })).toContainText('Price');
        await expect(page.getByLabel('Pricing', { exact: true })).toContainText('Unit');
        await expect(page.getByLabel('Pricing', { exact: true })).toContainText('Price per smallest dispensable unit');
        await expect(page.getByLabel('Pricing', { exact: true })).toContainText('14.0000');
        await expect(page.getByLabel('Pricing', { exact: true })).toContainText('10');
        await expect(page.locator('#accordion-content-1')).toContainText('Submission Details');
        await expect(page.locator('#accordion-content-1')).toContainText('Requested Funding/Listing/Program');
        await expect(page.locator('#accordion-content-1')).toContainText('Exceptional Access Program (EAP)');
        await expect(page.locator('#accordion-content-1')).toContainText('General Benefit (GB)');
        await expect(page.locator('#accordion-content-1')).toContainText('Limited Use (LU)');
        await expect(page.locator('#accordion-content-1')).toContainText('New Drug Funding Program (NDFP)');
        await expect(page.locator('#accordion-content-1')).toContainText('Health Canada Indication(s)');
        await expect(page.locator('#revQuesAnsValidRowTextAreaINDICATIONSview')).toContainText('test message');
        await expect(page.locator('#accordion-content-1')).toContainText('Health Canada Documentation');
        await expect(page.locator('#accordion-content-1')).toContainText('Notice of Compliance Information');
        await expect(page.locator('#accordion-content-1')).toContainText('NOC Approved Date');
        await expect(page.locator('#accordion-content-1')).toContainText('2026-01-05');
        await expect(page.locator('#accordion-content-1')).toContainText('Submission Control Number');
        await expect(page.locator('#accordion-content-1')).toContainText('12345678');
        await expect(page.locator('#accordion-content-1')).toContainText('Notice of Compliance');
        await expect(page.locator('#accordion-content-1')).toContainText('testDocs1.docx');
        await expect(page.locator('#accordion-content-1')).toContainText('Product Monograph Information');
        await expect(page.locator('#accordion-content-1')).toContainText('Date of Product Monograph Revision');
        await expect(page.locator('#accordion-content-1')).toContainText('2026-01-05');
        await expect(page.locator('#accordion-content-1')).toContainText('Submission Control Number');
        await expect(page.locator('#accordion-content-1')).toContainText('12345678');
        await expect(page.locator('#accordion-content-1')).toContainText('Product Monograph');
        await expect(page.locator('#accordion-content-1')).toContainText('testDocs2.docx');
        await expect(page.locator('#accordion-content-1')).toContainText('Line Extension Details');
        await expect(page.locator('#accordion-content-1')).toContainText('Justification of need for the new format/strength for the Drug Product');
        await expect(page.locator('#accordion-content-1')).toContainText('testDocs3.docx');
        await expect(page.locator('#accordion-content-1')).toContainText('Does the Line Extension Product contain the same drug product solution, produced using the same master formulation, as the previously approved/listed biosimilar product?');
        await expect(page.locator('#accordion-content-1')).toContainText('No');
        await expect(page.locator('#accordion-content-1')).toContainText('Evidence of formulation proportionality and/or bioequivalence, as applicable, between the previously approved/listed biosimilar product and the Line Extension Product');
        await expect(page.locator('#accordion-content-1')).toContainText('testfileexcel.xlsx');
        await expect(page.locator('#accordion-content-1')).toContainText('The scientific evidence upon which Health Canada approved the Biosimilar Line Extension Drug Product for sale in Canada');
        await expect(page.locator('#accordion-content-1')).toContainText('testDocs4.docx');
        await expect(page.locator('#accordion-content-1')).toContainText('Financial Impact Analysis');
        await expect(page.locator('#accordion-content-1')).toContainText('Budget Impact Analysis Report');
        await expect(page.locator('#accordion-content-1')).toContainText('testfileexcel2.xlsx');
        await expect(page.locator('#accordion-content-1')).toContainText('Budget Impact Analysis Model');
        await expect(page.locator('#accordion-content-1')).toContainText('testpdf1.pdf');
        await expect(page.locator('#accordion-content-1')).toContainText('OPDP Financial Impact Analysis Summary');
        await expect(page.locator('#accordion-content-1')).toContainText('testpdf2.pdf');
        await expect(page.locator('#accordion-content-1')).toContainText('Supplemental Information');
        await expect(page.locator('#accordion-content-1')).toContainText('Supporting Documents');
        await expect(page.locator('#accordion-content-1')).toContainText('testpdf3.pdf');
        await expect(page.locator('#accordion-content-1')).toContainText('Additional Information');
        await expect(page.locator('#revQuesAnsValidRowTextAreaSUPPLEMENTALADDITIONALINFOview')).toContainText('random text');
        await expect(page.locator('#accordion-content-1')).toContainText('Attestations');
        await expect(page.locator('#accordion-content-1')).toContainText('Do you, as the vendor, possess legal authority to bind the manufacturer, as evidenced by your documented business arrangement letter?');
        await expect(page.locator('#accordion-content-1')).toContainText('No');
        await expect(page.locator('#accordion-content-1')).toContainText('Letter of Consent');
        await expect(page.locator('#accordion-content-1')).toContainText('testpdf4.pdf');
        await expect(page.locator('#accordion-content-1')).toContainText('Ability to Supply Letter');
        await expect(page.locator('#accordion-content-1')).toContainText('testpdf5.pdf');
        await expect(page.locator('#accordion-content-1')).toContainText('Certification of Providing No Rebate Letter');
        await expect(page.locator('#accordion-content-1')).toContainText('testpdf5 (1).pdf');
    result = "All assertions in TC18 passed successfully.";
    }catch(e){
        console.log("Assertion failed in TC18 assertionsTC18:");
        result = e.message;
        throw new Error("Assertion failed in TC18 assertionsTC18: "+e.message);
    }
    return result;
} 

module.exports = {
  checkId,
  checkIdNonVisible,
  checkLiteralId,
  passParser,
  grabParser,
  grabSetParser,
  optionParser,
  grabSetDataFinder,
  findSetRowValue,
  grabDataFinder,
  passDataFinder,
  caseNameFinder,
  assertionsTC18
};
