const XLXS = require('xlsx');

const fs = require('fs');
const PATH_ORGAUTO = "test-data/InputCSVs/Input.csv";
const PATH_DROPDOWN = "test-data/InputCSVs/InputDropDown.csv";
const PATH_DROPDOWN_VALID = "test-data/InputCSVs/InputDropDownValid.csv";
const PATH_ORGAUTO_JSON = `${process.cwd()}\\test-data\\OutputJson\\output.json`;
const PATH_DROPDOWN_JSON = `${process.cwd()}\\test-data\\OutputJson\\outputDropDown.json`;
const PATH_DROPDOWN_VALID_JSON = `${process.cwd()}\\test-data\\OutputJson\\outputDropDownValid.json`

function convertCSVtoJSON(InPath, OutPath, sheetName) {
    const workbook = XLXS.readFile(InPath);
    // If sheetName is not provided, use the first sheet
    const selectedSheetName = sheetName || workbook.SheetNames[0];
    const sheet = workbook.Sheets[selectedSheetName];
    if (!sheet) {
        throw new Error(`Sheet '${selectedSheetName}' not found in ${InPath}`);
    }
    const data = XLXS.utils.sheet_to_json(sheet);
    
    const DataMap = data.reduce((acc,cur,i) => {
        const rowKey = `TCModule_${i+1}`;
        acc[rowKey] = cur;
        return acc;
    }, {});
    //logs to json file
     
    const strObjson = `{"ModuleTestData" : ${JSON.stringify(DataMap, null, 2)}}`;
    
    
    //change path on alternate pc
    fs.writeFileSync(OutPath,
         strObjson, 'utf8');
}
module.exports = {convertCSVtoJSON}