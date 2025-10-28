const interpretedPack = require("../interpreter/DSLInterpreter");
const { expect } = require('@playwright/test');
const { logToCSV, reset, setField, appendToField, getBuffer, addToBuffers } = require(`../../CSVLogger/CSVLogger.js`);
const { json } = require("stream/consumers");
const JsonDispatch = `${process.cwd()}\\DSLinterpreter\\JsonDispatch\\dispatch.json`;
const { ModuleTestData: dispatch } = require(JsonDispatch);


console.log(interpretedPack.DispatchPackets)
console.log(interpretedPack.Config)
console.log(interpretedPack.Data)



async function checkId(Id,page){
    let pass = false
    let locator;
    try{
        locator = await page.locator(`${Id}`);
        await locator.highlight();
        pass = true
    }catch(e){
        pass = false
    }
    return [pass, locator]

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
function optionParser(value){
    if (value.startsWith('option+')) {
        let finder = value.split('+')[1]; // Get the part after 'pass+'
        return finder;
    }
    return value;
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

//let test = passDataFinder("Names","Michael")
//let test2 = passDataFinder("Category Type","Product Submission")
//console.log(test)
//console.log(test2)
//
//          pass data from sheet to interpreter/dispatcher
//     #1 <pass+A5>
//
//     #2 <pass+names*michael>
//


module.exports = {
    CheckOperations: async function (page, operand,Id) {

        if (typeof operand !== 'string') {
            console.error('Operand must be a string');
            return;
        }
        const opKey = operand.toLowerCase();
        if (typeof module.exports[opKey] === 'function') {
            let test = await module.exports[opKey](page, operand,Id);
            return test
        } else {
            console.error(`No method found for operand: ${opKey}`);
        }
    },
    "click": async (page, Operand,Id) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);

        let pass = false
        let actual = ''
        let pack = await checkId(Id,page)
        let locator = pack[1]
        pass = pack[0]
         try{
            await locator.click()
            actual = await locator.textContent()
            if (actual == ''){
                actual = "the element clicked contained no text"
            }
        }catch(e){
            console.log(e)
            pass = false
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:" ${Id} which contained:${actual}`); 
        return [pass, actual]
    },
    "select": async (page, Operand,Id) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
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
                    await dropdown.selectOption(desiredOption);
                    pass = true;
                    actual = await dropdown.inputValue();
                    break; // Exit the loop once the correct dropdown is found and option is selected
                }
            }
        }catch(e){
            console.log(e)
            pass = false
        }
        console.log(pass)
        console.log(`Complete Operation ${Operand} with Id:"${Id} which contained:${actual}`); 
        return [pass, actual]
    },
    "isvisible": async (page, Operand,Id) => {
        /*
        currently only checks the first instance of the locator if there are multiple
        */
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
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
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation 'isVisible' with Id:" ${Id} which contained:${actual}`); 

        return [pass, actual]
    },
    //Needs work to check all instances of the locator, how do we want this returned for logging
    "isvisible*": async (page, Operand,Id) => {
        //!!!!!!!!!!!!!! NON FUNCTIONAL NEEDS WORK !!!!!!!!!!!!!/
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
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
            console.log(e)
            pass = false
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation 'isVisible*' with Id:" ${Id} which contained:${actual}`); 

        return [pass, actual]
    },
    //needs to pull data from data sheet
    "type": async (page, Operand,Id) => {
        const parsed = Id.split('~');
        console.log(parsed);
        let value =  parsed[1]; // Extract value after '~'
        const id = parsed[0];
        if( value.startsWith('pass+')){
            value = passParser(value);
        }
        console.log(`Attempting Operation "${Operand}" with Id:"${id}" to type value: "${value}"`);
        let pass = false;
        let actual = '';
        let pack = await checkId(id,page);
        let locator = pack[1];
        pass = pack[0];
        try{
            await locator.fill(value);
            actual = await locator.inputValue();
        }catch(e){
            console.log(e)
            pass = false
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [pass, actual]
    },
    //needs to pull data from data sheet
     "input": async (page, Operand,Id) => {
        console.log(`Attempting Operation "${Operand}" with input:"${Id}"`);
        if( Id.startsWith('pass+')){
            Id = passParser(Id);
        }
        let pass = false;
        let actual = '';
        try{
            await page.keyboard.type(Id);
            actual = Id
            pass = true
        }catch(e){
            console.log(e)
            pass = false
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [pass, actual]
    },
    //needs to pull data from data sheet
    "assert": async (page, Operand,Id) => {
        const parsed = Id.split('~');
        console.log(parsed);
        let value =  parsed[1]; // Extract value after '~'
        console.log(value);
        const id = parsed[0];
        if( value.startsWith('pass+')){
            value = passParser(value);
        }
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        let pass = false;
        let actual = '';
        let pack = await checkId(id,page);
        let locator = pack[1];
        pass = pack[0];
        try{
            console.log(`Asserting that locator contains text: "${value}"`);
            await expect(locator).toHaveText(value,{timeout:5000});
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
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [pass, actual]
    },
    "wait": async (page, Operand,Id) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        let pass = false;
        let actual = '';
        try{
            await page.waitForTimeout(parseInt(Id));
            actual = `seconds waited: ${Id}`;
            pass = true;
        }catch(e){
            console.log(e)
            pass = false
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [pass, actual]
    },
    "navigate": async (page, Operand,Id) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        let pass = false;
        let actual = '';
        try{
           await page.goto(Id);
           actual = `navigated to: ${Id}`;
           pass = true;
        }catch(e){
            console.log(e)
            pass = false
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [pass, actual]
    },
    "screenshot": async (page, Operand,Id) => {
        console.log(`Attempting Operation "${Operand}" with Id:"${Id}"`);
        let pass = false;
        let actual = '';
        try{
           await page.screenshot({ path: process.cwd()+`/screenshots/${Id}.jpeg`, fullPage: true });
           actual = `screenshot saved as: ${Id}.png`;
           pass = true;
        }catch(e){
            console.log(e)
            pass = false
        }
        console.log(pass)
        console.log(`Complete ${Operand} Operation with Id:" ${Id} which contained:${actual}`); 

        return [pass, actual]
    },

};