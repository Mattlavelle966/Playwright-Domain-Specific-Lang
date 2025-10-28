const dataInit = require("../../Converters/CSVtoJSON");
const JsonDispatch = `${process.cwd()}\\DSLinterpreter\\JsonDispatch\\dispatch.json`;
const JsonConfig = `${process.cwd()}\\DSLinterpreter\\JsonDispatch\\DSL-config.json`;
const JsonData = `${process.cwd()}\\DSLinterpreter\\JsonDispatch\\DSL-Data.json`;
const PATH = "DSL-Logic&Data\\DSL-Logic-Data-Config.xlsx";
dataInit.convertCSVtoJSON(PATH,JsonDispatch,"TestLogic");
dataInit.convertCSVtoJSON(PATH,JsonConfig,"Config");
dataInit.convertCSVtoJSON(PATH,JsonData,"Data");
const { ModuleTestData: Dispatch } = require(JsonDispatch);
const { ModuleTestData: Config } = require(JsonConfig);
const { ModuleTestData: Data } = require(JsonData);



console.log("Dsl init started")

// parser
// "action" is ahead of "="
// ID starts with a '#' and comes after "="
// a ";" is the prime delimitter for each action
//read TCmodule and generate a step block e.g a step block is all- 
//  actions under a single ExecStep#* for this well need a ExecStep parser-
//  and a block parser. what the block parse generates will be sent to the dispatcher 
//  to complete all the interactions and reporting 
//  SB=Step block 
//
//  | ExecStep#1                      | ExecStep#2        | ExecStep#3                                   | ExecStep#3    |      
//  | click=#id;input="someString";   | click=#id;        | Assert=#id.contains="ExpectedString"         | End           |   
//   {^ Action ^}                      {^ Action ^} 
//   {^-----------SB-------------^}    {^---SB---^}        {^----------------SB----------------^}
//   {^----------------------------------Automation logic----------------------------------------------------^}
//  
// the diagram above describes the way the interpreter will handle multiple actions within a single ExecStep#*
// there will also be features like the Automation logic keyword "end", will tell the interpreter to that this is the end of a test(automation logic)
// the diagram below describes the way the interpreter organizes the automation logic over multiple rows per 1 test, this is here so you can describe many diffrent tests within 
// 1 logic sheet and delimit each test with the "end" keyword
//  | ExecStep#1                      | ExecStep#2        | ExecStep#3                                   |         |     
//  | click=#id;input="someString";   | click=#id;        | click=#id;                                   |         |      
//   {^----------------------------------Automation logic Part1------------------------------------------
//  | ExecStep#1                      | ExecStep#2        | ExecStep#3                                   |         |     
//  | click=#id;                      | click=#id;        | Assert=#id.contains="ExpectedString";        |  end    |      
//  --------------------------------------Automation logic Part2--------------------------------^}
// the diagram above is an example of the use of the keyword "continue" to tell the interpreter to read in multiple rows as a single test



//each row needs to be looped through with the max number of ExecSteps# this can by getting the max number of ExecSteps# from 
// the total number of keys within the tcmodule#* but we must check the last key for the continue keyword to see if we need to loop again
function getExecSteps(module) {

    let array = [];
    const headers = Object.keys(module);
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].startsWith("ExecStep#")) {
            array.push(module[headers[i]]);
        }
    }
    return array;
}



const totalModules = Object.keys(Dispatch).length
const TestBlocks = []
let testCounter = 0;
for (let i = 1; i <= totalModules; i++) {
    const moduleKey = `TCModule_${i}`;
    const stepsArray = getExecSteps(Dispatch[moduleKey]);

    console.log("steps:"+stepsArray)
    for (let j = 0; j < stepsArray.length; j++) {

        let check = stepsArray[j].toLowerCase()
        console.log("check:"+check)
        if(stepsArray[j].toLowerCase() == "end"){
            testCounter++;
        }else{
            if (TestBlocks[testCounter] == undefined){
                TestBlocks.push("")
            }
            console.log("TestBlocks:"+TestBlocks[testCounter])
            console.log("stepsArray[j]:"+String(stepsArray[j]).split(";"))
            TestBlocks[testCounter] += (String(stepsArray[j]).split(";").join("|"));
        }
        
    }

}

//still needs end clause or chuck stepblocks and process the whole test at once and load it into a 
// sing array of tests, it ill need to scan for end clause or continue clause to know when a test is done
console.log(TestBlocks);
const DispatchPackets = {};
for (let i = 0; i < TestBlocks.length; i++) {
    const logicArray = TestBlocks[i].split("|");
    let DispatchPacket = [];
    let key = "Test_"+(i);
    //let nameSet = false;
    for (let j = 0; j < logicArray.length; j++) {
        //add key value pairs to logic table split by =
        const [action, target] = logicArray[j].split("=");
        console.log("action:"+action);
        if (action.toLowerCase() == "name") {
            key = target;
            continue; // Skip invalid entries
        }
        if (action == "" || action == undefined) {
            continue; // Skip invalid entries
        }

        DispatchPacket.push({action, target});
    }
    DispatchPackets[key] = DispatchPacket;   
}

console.log(DispatchPackets);


module.exports = {DispatchPackets, Config, Data};