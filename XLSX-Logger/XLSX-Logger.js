//import ExcelJS from 'exceljs';
const ExcelJS = require('exceljs')
const path = require('path');
const imagePath = path.resolve( 'screenshots', 'closeScreen.jpeg')


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


async function createReport() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Automation Report');

  // Add header row
  sheet.addRow(['Test Name', 'Status', 'Duration']);

  // Add data row
  const row = sheet.addRow(['Login Test', 'Passed', '2.3s']);

  // Color a cell (e.g., Status column)
  row.getCell(2).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF00FF00' } // Green for Passed
  };

  // Add bold text style
  row.getCell(1).font = { bold: true };

  // Insert an image
  insertImage(sheet, workbook, imagePath, 3, 0, 100, 50);  

  // Save the file
  await workbook.xlsx.writeFile('AutomationReport.xlsx');
  console.log('Report created!');
}

//how should the reports be written if were currently only returning "success or failure"
//  and the actual value we received/interacted.

//solution:
// 1: add a formatin syntax to the interpreter to add labels to steps or a test
// 2: create a standard report format that includes expected vs actual values for each step
// 3: log each step with its result (success/failure) and the corresponding values
// 4: generate a summary at the end of the report highlighting any discrepancies
//createReport();


