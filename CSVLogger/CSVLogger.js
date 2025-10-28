const fs = require('fs');
const OUTPUT_FILE = 'test-data/OutputCSVs/output.csv';
const OUTPUT_FILE_DROPDOWN = 'test-data/OutputCSVs/outputDropDown.csv';



// Adjust report format ass needed

let Buffers = [];
let logBuffer = {
  TestNumber: "", ScenarioName: "", IdOperand: "",IdExpected:"",IdActual:"",SearchTerm: "", SearchResult: "", OrganizationNameExpected: "",
   OrganizationNameActual: "", CompanyCodeExpected: "", CompanyCodeActual: "", CompanyTypeExpected: "",CompanyTypeActual: "", 
   PhoneNumberExpected: "", PhoneNumberActual: "", EmailExpected: "", EmailActual: "", AddressLine1Expected: "", AddressLine1Actual: "",AddressLine2Expected: "", AddressLine2Actual: "", 
   AddressLine3Expected: "", AddressLine3Actual: "", CityExpected: "", CityActual: "", ProvinceStateExpected: "", ProvinceStateActual: "", 
   CountryExpected: "", CountryActual: "", PostalZipCodeExpected: "", PostalZipCodeActual: "",ExpectedResult:"",ActualResult:"",  PassFail: "", Errors: "",RunTime: "",EndTime:""
};

function CreationLogToCSV(path,{ TestNumber, ScenarioName, IdOperand,IdExpected,IdActual,SearchTerm, SearchResult, OrganizationNameExpected,
   OrganizationNameActual, CompanyCodeExpected, CompanyCodeActual, CompanyTypeExpected,CompanyTypeActual, 
   PhoneNumberExpected, PhoneNumberActual, EmailExpected, EmailActual, AddressLine1Expected, AddressLine1Actual,AddressLine2Expected, AddressLine2Actual, 
   AddressLine3Expected, AddressLine3Actual, CityExpected, CityActual, ProvinceStateExpected, ProvinceStateActual, 
   CountryExpected, CountryActual, PostalZipCodeExpected, PostalZipCodeActual,ExpectedResult,ActualResult,  PassFail, Errors,RunTime,EndTime }) {
    const row = [TestNumber, ScenarioName, IdOperand,IdExpected,IdActual,SearchTerm, SearchResult, OrganizationNameExpected,
   OrganizationNameActual, CompanyCodeExpected, CompanyCodeActual, CompanyTypeExpected,CompanyTypeActual, 
   PhoneNumberExpected, PhoneNumberActual, EmailExpected, EmailActual, AddressLine1Expected, AddressLine1Actual,AddressLine2Expected, AddressLine2Actual, 
   AddressLine3Expected, AddressLine3Actual, CityExpected, CityActual, ProvinceStateExpected, ProvinceStateActual, 
   CountryExpected, CountryActual, PostalZipCodeExpected, PostalZipCodeActual,ExpectedResult,ActualResult, PassFail, Errors,RunTime,EndTime].join(',') + '\n';
    fs.appendFileSync(path, row);
}
//function below is not designed with the BUFFER OBJ in mind
function logToCSVFormatDropDown(path,{ TestNumber, ScenarioName, Selection, ExpectedValue, ActualValue, PassFail, Errors }) {
    const row = [TestNumber, ScenarioName, Selection, ExpectedValue, ActualValue, PassFail, Errors].join(',') + '\n';
    fs.appendFileSync(path, row);
}


function getBuffers(){
    return Buffers
}
function addToBuffers(){
    Buffers.push(logBuffer)
}
module.exports = {
  setField: (key, value) => logBuffer[key] = value,
  appendToField: (key, value) => logBuffer[key] += value,
  getBuffer: () => logBuffer,
  addToBuffers,
  getBuffers,
  resetAllBuffers: () => {
    Buffers = [];
  },
  reset: () => {
    logBuffer = {
    TestNumber: "",
    ScenarioName: "",
    IdOperand: "",
    IdExpected:"",
    IdActual:"",
    SearchTerm: "",
    SearchResult: "",
    OrganizationNameExpected: "",
    OrganizationNameActual: "",
    CompanyCodeExpected: "",
    CompanyCodeActual: "",
    CompanyTypeExpected: "",
    CompanyTypeActual: "",
    PhoneNumberExpected: "",
    PhoneNumberActual: "",
    EmailExpected: "",
    EmailActual: "",
    AddressLine1Expected: "",
    AddressLine1Actual: "",
    AddressLine2Expected: "",
    AddressLine2Actual: "",
    AddressLine3Expected: "",
    AddressLine3Actual: "",
    CityExpected: "",
    CityActual: "",
    ProvinceStateExpected: "",
    ProvinceStateActual: "",
    CountryExpected: "",
    CountryActual: "",
    PostalZipCodeExpected: "",
    PostalZipCodeActual: "",
    ExpectedResult:"",
    ActualResult:"",
    PassFail: "",
    Errors: "",
    RunTime: "",
    EndTime:""


    };
  },
  CreationLogToCSV,
  logToCSVFormatDropDown
}
