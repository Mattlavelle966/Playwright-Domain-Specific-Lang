const interpretedPack = require("../interpreter/DSLInterpreter");
const { expect } = require('@playwright/test');
const { json } = require("stream/consumers");
const { error, time } = require("console");
const { errors } = require("playwright");
const { parse } = require("path");
const JsonDispatch = `${process.cwd()}\\DSLinterpreter\\JsonDispatch\\dispatch.json`;
const { ModuleTestData: dispatch } = require(JsonDispatch);
const {
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
} = require("./DSLDispatchTools");

console.log(interpretedPack.DispatchPackets)
console.log(interpretedPack.Config)
console.log(interpretedPack.Data)


module.exports = {
    CheckOperations: async function (page, operand,Id,interpretedPack,index,subIndex) {

        if (typeof operand !== 'string') {
            console.error('Operand must be a string');
            return;
        }
        const opKey = operand.toLowerCase();
        if (typeof module.exports[opKey] === 'function') {
            let test = await module.exports[opKey](page, operand,Id,interpretedPack,index,subIndex);
            return test
        } else {
            console.error(`No method found for operand: ${opKey}`);
        }
    },
    "click": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        let pack = await checkId(Id,page);
        let locator = pack[1];
        pass = pack[0];
         try{
            await locator.click({timeout:5000})
            try{
                actual = await locator.textContent({timeout:500});
            }catch(e){
                console.log("Could not grab text content after click, element may not contain text.");
            }
            if (actual == ''){
                actual = "the element clicked contained no text"
            }
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    //await page.keyboard.press('Shift+Tab')
    "press": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = 'N/A';
       
         try{
            await page.keyboard.press(Id)
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "grab-pfn": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = 'N/A';
       
         try{
            const fileNumberText = await page.textContent('app-submit-success-dialog p span',{timeout:30000});
            actual = fileNumberText;
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "validate-sharepoint": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = 'N/A';
       
         try{
            if(Id == ''){throw new Error("No PFN provided for SharePoint validation");}
            await page.goto('https://ontariogov.sharepoint.com/sites/SADIEFlexForms/DIRECTDoc/default.aspx');
            await page.getByRole('link', { name: '2026 Submissions, Folder' }).click();
            await page.getByRole('textbox', { name: 'Type something and hit enter' }).fill(Id);
            await page.getByRole('textbox', { name: 'Type something and hit enter' }).press('Enter');
            const links = await page.getByRole('link', { name: /^test/i }).allTextContents();


            actual = links;


            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "click-btn": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = 'N/A';
       
         try{
            await page.getByRole('button', { name: Id }).click({timeout:500});
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "download": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = 'N/A';
       
         try{
            // Click the download button and wait for the download event
            const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click(Id)
            ]);
            let path = 'PFN/' + Date.now() + '-' + download.suggestedFilename();
            // Save the file to a specific path
            await download.saveAs(path);
            actual = path;
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "textbox-fill": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        Id = Id.split('~');
        let SearchParam = Id[0];
        let input = Id[1];
         try{
            try{
                await page.getByRole('textbox', { name: SearchParam }).click({timeout:5000});
                await page.getByRole('textbox', { name: SearchParam }).fill(input,{timeout:5000});
            }catch(e){
                console.log("Could not find by name, trying nth(1) "+e);
                await page.getByRole('textbox', { name: SearchParam }).nth(1).click({timeout:5000});
                await page.getByRole('textbox', { name: SearchParam }).nth(1).fill(input,{timeout:5000});
            }

            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "textbox-click": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{
            await page.getByRole('textbox', { name: Id }).click({timeout:5000});
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "id-upload": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        Id = Id.split('~');
        let ID = Id[0];
        let DIR = Id[1];
        let pack;
        if(ID.includes(',')){
            pack = await checkIdNonVisible(ID,page);
        }else{
            ID = "input"+ID;
            pack = await checkLiteralId(ID,page);
        }
        let locator = pack[1];
        pass = pack[0];
        try{

            await locator.setInputFiles(DIR,{timeout:5000});
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "card-upload": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        Id = Id.split('~');
        let cardNumber = Id[0];
        let DIR = Id[1];
        try{
            const input = page.locator('mat-card').nth(cardNumber).locator('input[type="file"], input[id*="multiDrop"], input[id*="singleDrop"]').first();
            await input.setInputFiles(DIR,{timeout:5000});
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "specific-upload": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{
            await page.setInputFiles('input[type="file"] input[id*="multiDrop"], input[id*="singleDrop"], input[id*="Upload"]',Id,{timeout:5000});
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "radio-btn": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        Id = Id.split('~');
        let name = Id[0];
        let yesOrNo = Id[1];
        try{
            
            await page.getByRole('group', { name: name }).getByRole('radio', { name: yesOrNo }).check({ timeout: 5000 });
            //
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "radio-btn-filter": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        Id = Id.split('~');
        let name = Id[0];
        let yesOrNo = Id[1];
        try{
            
            await page.getByRole('group').filter({ hasText: name }).getByRole('radio', { name: yesOrNo }).check({ timeout: 5000 });
            //
            pass = true;
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]];
    },
    "select": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        const parsed = Id.split('~');
        const ID = parsed[0];
        let pass = false
        let actual = ''
        let pack = await checkId(ID,page)
        let desiredOption;
        if( parsed[1].startsWith('option+')){
            desiredOption = optionParser(parsed[1]);
        } else {
            desiredOption = parsed[1];
        }
        let locator = pack[1]
         try{
            const visibleDropdowns = await page.locator('select:visible');
            const count = await visibleDropdowns.count();
            const allOptions = await visibleDropdowns.locator('option').allTextContents()
            console.log('visible select count:', count);
            for (let i = 0; i <= count; i++) {
                const dropdown = visibleDropdowns.nth(i);
                const dropdownId = await dropdown.getAttribute('id');
                console.log(`Dropdown ${i} ID:`, dropdownId);
                console.log(dropdown)
                console.log(await dropdown.allTextContents())
                console.log(`"${dropdownId}" == "${ID}"`)
                if ("#" + dropdownId == ID) {
                    console.log("Id's match");
                    console.log(`Selecting option "${desiredOption}"`);
                    await dropdown.selectOption(desiredOption, { timeout: 5000 });
                    pass = true;
                    actual = await dropdown.inputValue();
                    break; // Exit the loop once the correct dropdown is found and option is selected
                }
            }
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:"${Id} which contained:${actual}`); 
        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, ID, ``,actual, pass, errors[0]];
    },
    "isvisible": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false
        let actual = ''
        let pack = await checkId(Id,page)
        let locator = pack[1]
        pass = pack[0]
        try{

            //nth is for  handling multiple instances of the same locator id
            await expect(locator.nth(0)).toBeVisible({timeout:5000});
            actual = await locator.nth(0).textContent()
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation 'isVisible' with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]]
    },
    //Needs work to check all instances of the locator, how do we want this returned for logging
    "isvisible*": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        //!!!!!!!!!!!!!! NON FUNCTIONAL NEEDS WORK !!!!!!!!!!!!!/
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false
        let actual = ''
        let pack = await checkId(Id,page)
        let locator = pack[1]
        pass = pack[0]
        try{
            
            for (let i = 0; i < locator.count(); i++) {
                await expect(locator.nth(i)).toBeVisible({timeout:5000});
                actual += `, "${await locator.nth(i).textContent()}"`
            }         
            pass = true
        }catch(e){
            console.log(e);
            pass = false;
            errors.push(e.message);

        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation 'isVisible*' with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass, errors[0]]
    },
    //needs to pull data from data sheet
    "type": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        const errors = [];
        const parsed = Id.split('~');
        console.log(parsed);
        let value =  parsed[1]; // Extract value after '~'
        const id = parsed[0];
        if( value.startsWith('pass+')){
            value = passParser(value);
        }
        if(value.startsWith('grab+')){
            value = grabParser(value,interpretedPack,index);
        }
        if(value.startsWith('grabset+')){
            value = grabSetParser(value,interpretedPack,index);
        }
        console.log(`Attempting Operation "${Operand}" with Id:"${id}" to type value: "${value}"`);
        let pass = false;
        let actual = '';
        let pack = await checkId(id,page);
        let locator = pack[1];
        pass = pack[0];
        try{
            await locator.fill(value, {timeout:5000});
            actual = await locator.inputValue();
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, id, ``,actual, pass, errors[0]]
    },
    //needs to pull data from data sheet
     "input": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with input:"${Id}"`);
        const errors = [];
        if( Id.startsWith('pass+')){
            Id = passParser(Id);
        }
        if(Id.startsWith('grab+')){
            Id = grabParser(Id,interpretedPack,index);
        }
        if(Id.startsWith('grabset+')){
            Id = grabSetParser(Id,interpretedPack,index);
        }
        let pass = false;
        let actual = '';
        if (typeof Id === "number"){
            Id = Id.toString();
        }
        try{
            
            await page.keyboard.type(Id,{timeout:5000});
            actual = Id
            pass = true
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, "n/a","", actual, pass, errors[0]]
    },
    "file-assert": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with input:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{
            await expect(page.locator('#accordion-content-1')).toContainText('testDocs1.docx');
            await expect(page.locator('#accordion-content-1')).toContainText('testDocs2.docx');
            await expect(page.locator('#accordion-content-1')).toContainText('testDocs3.docx');
            await expect(page.locator('#accordion-content-1')).toContainText('testfileexcel.xlsx');
            await expect(page.locator('#accordion-content-1')).toContainText('testDocs4.docx');
            await expect(page.locator('#accordion-content-1')).toContainText('testfileexcel2.xlsx');
            await expect(page.locator('#accordion-content-1')).toContainText('testpdf2.pdf');
            await expect(page.locator('#accordion-content-1')).toContainText('testpdf3.pdf');
            await expect(page.locator('#accordion-content-1')).toContainText('testpdf4.pdf');
            await expect(page.locator('#accordion-content-1')).toContainText('testpdf5.pdf');
            await expect(page.locator('#accordion-content-1')).toContainText('testpdf5 (1).pdf');
            pass = true;
            actual = 'All files found in upload accordion';
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
            actual = 'One or more files not found in upload accordion';
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, "n/a","", actual, pass, errors[0]]
    },
    //needs to pull data from data sheet
    "assert": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        const errors = [];
        const parsed = Id.split('~');
        console.log(parsed);
        let value =  parsed[1]; // Extract value after '~'
        console.log('typeof value:', typeof value, 'value:', value);
        const id = parsed[0];
        if(value.startsWith('pass+')){
            value = passParser(value);
        }
        if(value.startsWith('grab+')){
            value = grabParser(value,interpretedPack,index);
        }
        if(value.startsWith('grabset+')){
            value = grabSetParser(value,interpretedPack,index);
        }
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        let pass = false;
        let actual = '';
        let pack = await checkId(id,page);
        let locator = pack[1];
        pass = pack[0];
        try{
            console.log(`Asserting that locator contains text: "${value}"`);
            await expect(locator).toHaveText(value,{timeout:10000});
            actual = await locator.textContent();
            pass = true
        }catch(e){
            if(value == null){
                //dont do it like this in the future we should have an error array that is returned with each action,
                //these massages should be very descriptive to help the user know what went wrong.
                actual = "The value to assert was not found in the data sheet"
            }
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, id, value, actual, pass, errors[0]]
    },
    "wait": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{
            await page.waitForTimeout(parseInt(Id));
            actual = `seconds waited: ${Id}`;
            pass = true;
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, ``,actual, pass,errors[0]]
    },
    "navigate": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{
           await page.goto(Id,{timeout:10000});
           actual = `navigated to: ${Id}`;
           pass = true;
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, `${Operand}=${Id}`,actual, pass, errors[0]];
    },
    "screenshot": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const timestamp = new Date().toISOString().replace(/[:]/g, '-');
        const errors = [];
        let pass = false;
        let actual = '';
        const imagePath = process.cwd()+`\\screenshots\\${Id}${timestamp}.jpeg`;
        try{
           await page.screenshot({ path: imagePath, fullPage: true });
           actual = `screenshot saved as: ${Id}.jpeg`;
           pass = true;
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, imagePath, "", actual, pass, errors[0]];
    },
    "login": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{
            
            await page.goto(Id,{timeout:10000});
            
           pass = true;
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, "", actual, pass, errors[0]];
    }, 
    "waitforevent": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{

            const page1Promise = await page.waitForEvent(Id);
            pass = true;

        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, "", actual, pass, errors[0]];
    },
    "scroll-up-down": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{
            await page.mouse.wheel(0, parseInt(Id));
            pass = true
        }catch(e){
            actual = "Scroll failed or value was invalid"
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, "N/A", actual, pass, errors[0]]
    },
    "scroll-side": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{
            await page.mouse.wheel(parseInt(Id),0);
            pass = true
        }catch(e){
            actual = "Scroll failed or value was invalid"
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, Id, "N/A", actual, pass, errors[0]]
    },
    "file-tc18-assert": async (page, Operand,Id,interpretedPack,index,subIndex) => {
        console.log(`Attempting Operation "${Operand}" with input:"${Id}"`);
        const errors = [];
        let pass = false;
        let actual = '';
        try{
            actual = await assertionsTC18(page);
            pass = true;
        }catch(e){
            console.log(e)
            pass = false
            errors.push(e.message);
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [ caseNameFinder(interpretedPack,index),index,subIndex,Operand, "n/a","", actual, pass, errors[0]]
    },

};