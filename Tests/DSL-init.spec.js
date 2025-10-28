import { test, expect } from '@playwright/test';
import chalk from 'chalk';

try{
    const interpretedPack = require("../DSLinterpreter/interpreter/DSLInterpreter");
    const dispatcher = require("../DSLinterpreter/Dispatcher/DSLDispatcher");
    console.log("DSL interpreted package successfully imported.")
    //
    for (const key of Object.keys(interpretedPack.DispatchPackets)) {
        test(`${key}`, async ({ page }) => {
            const RESULTS = [];
            const InternalExternal = interpretedPack.Config["TCModule_1"]["External/Internal"].toLowerCase();
            await page.goto(interpretedPack.Config["TCModule_1"]["URL#1"]);
            console.log(interpretedPack.Config["TCModule_1"]["External/Internal"].toLowerCase())

            if (interpretedPack.Config["TCModule_1"]["External/Internal"].toLowerCase() == "external"){
                try{
                    await page.getByRole('radio', { name: 'External' }).check();
                }catch(e){
                    console.log(e)
                }
            }
            const page1Promise = page.waitForEvent('popup');
            if(interpretedPack.Config["TCModule_1"]["Auto login"] != null){
                await page.getByRole('button', { name: 'Log In' }).click();
            }
            try{
                if(InternalExternal == "external"){
                    await page.getByRole('button', { name: 'Accept' }).click({timeout:500});
                }
            }catch(e){
                console.log("skipping Accept button")
            }
            await page.waitForSelector(".titleContainer");
            await page.goto(interpretedPack.Config["TCModule_1"]["URL#2"]);

            try{
                let keys = Object.keys(interpretedPack.DispatchPackets);
                for(let i=0; i<keys.length;i++){
                    console.log(keys[i]);
                    const block = interpretedPack.DispatchPackets[keys[i]];
                    if (keys[i] == key){
                        for(let j=0; j<block.length;j++){
                            let step = block[j];
                            console.log(`Action="${step.action}", Target="${step.target}"`);
                            const result = await dispatcher.CheckOperations(page, step.action, step.target);
                            console.log(result);
                            RESULTS.push(result);
                        }
                    }
                }
            }catch(e){
                console.log("Failed to execute the dispatcher");
                console.log(e);
            }

            console.log(RESULTS);
            //REPORTING HAPPENS HERE

        });

    }



}catch(e){
    console.log("Failed to initalize the DSL interpreter")
    console.log(e)
}

