import { test, expect } from '@playwright/test';
import chalk from 'chalk';
const ExcelJS = require('exceljs')
const path = require('path');
const imagePath = path.resolve( 'screenshots', 'closeScreen.jpeg')
const runTime = new Date().toISOString().replace(/[:]/g, '-')
let Primary_File_Number = '';



async function insertImage(sheet, workbook, imagePath, col, row, width, height) {
  //only work for jpegs
  const imageId = workbook.addImage({
    filename: imagePath, // Path to your image
    extension: 'jpeg'
  });

  sheet.addImage(imageId, {
    tl: { col: col, row: row }, // top-left position
    ext: { width: height, height: width } // size
  });

}

try{
    const interpretedPack = require("../DSLinterpreter/interpreter/DSLInterpreter");
    const dispatcher = require("../DSLinterpreter/Dispatcher/DSLDispatcher");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Automation Report');
    //insert header 
    sheet.addRow(['TestCaseName','TestCase#','TestCaseStep','Action', 'Target', 'Expected', 'Result', 'Pass/Fail', 'Screenshot',"Errors","start Time","end Time"]);
    console.log("DSL interpreted package successfully imported.")
    //
    for (const key of Object.keys(interpretedPack.DispatchPackets)) {
        test(`${key}`, async ({ page }) => {
            const RESULTS = [];
            const TotalTime = 5000 * Object.keys(interpretedPack.DispatchPackets[key]).length
            test.setTimeout(TotalTime);
            console.log(chalk.blue(`test case: ${key} has been alloted a timeout of ${TotalTime}ms`));
            try{
                let keys = Object.keys(interpretedPack.DispatchPackets);
                for(let i=0; i<keys.length;i++){
                    console.log(keys[i]);
                    const block = interpretedPack.DispatchPackets[keys[i]];
                    if (keys[i] == key){
                        for(let j=0; j<block.length;j++){
                            let step = block[j];
                            console.log(`Action="${step.action}", Target="${step.target}"`);
                            const startTime = new Date().toISOString().replace(/[:]/g, '-')
                            //maybe pass in the index and the whole test object for better grab functionality
                            //perhaps just pass in the whole interpretedPack object with the index,
                            let result;
                            if (step.action.toLowerCase() == "validate-sharepoint" || step.target.toLowerCase() == "pfn"){
                                result = await dispatcher.CheckOperations(page, step.action, Primary_File_Number,interpretedPack,i,j);
                            }else{
                                result = await dispatcher.CheckOperations(page, step.action, step.target,interpretedPack,i,j);
                            }
                            
                            if (result == undefined){
                                console.log("No result returned from dispatcher, skipping result logging for this step.");
                                continue;
                            }

                            if(step.action == "grab-pfn"){
                                Primary_File_Number = result[6].match(/P\d+-\d{4}-\d{2}-\d{2}/)[0];
                            }

                            console.log(result);
                            const errors = result[8] || "";
                            result[8] = '';
                            result.push(errors);
                            RESULTS.push(result);
                            const newRow = sheet.addRow(result);
                            newRow.getCell(14).value = startTime;
                            if (result[7] == true){
                                newRow.getCell(8).fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: 'FF00FF00' } // Green for Passed
                                };
                            }else{
                                newRow.getCell(8).fill = {
                                    type: 'pattern',
                                    pattern: 'solid',   
                                    fgColor: { argb: '00FF0000' }
                                    }    
                            }
                            if (step.action.toLowerCase() == "screenshot"){
                                console.log("image found in results, inserting into report");
                                console.log("image path:"+result[4]);
                                insertImage(sheet, workbook, result[4], 8, newRow.number -1, 100, 50);
                            }
                            const endTime = new Date().toISOString().replace(/[:]/g, '-');
                            newRow.getCell(15).value = endTime;
                        }
                    }
                }
            }catch(e){
                console.log("Failed to execute the dispatcher");
                console.log(e);
            }
            //in future runTime can relace test
            await workbook.xlsx.writeFile(`Reports/${key}-report-${runTime}.xlsx`);
            console.log(RESULTS);
            //REPORTING HAPPENS HERE

        });

    }



}catch(e){
    console.log("Failed to initalize the DSL interpreter")
    console.log(e)
}

