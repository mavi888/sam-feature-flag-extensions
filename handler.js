'use strict';

const http = require('http');

async function getAppConfig(url) {

    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            if (res.statusCode < 200 || res.statusCode>= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }
            var body = [];
            res.on('data', function(chunk) {
                body.push(chunk);
            });
            res.on('end', function() {
                resolve(Buffer.concat(body).toString());
            });
        });
        req.on('error', (e)=> {
            reject(e.message);
        });
        req.end();
    });
}

async function getConfig() {
    let appconfigPort = 2772;

    const url = `http://localhost:${appconfigPort}`
        + `/applications/${process.env.APPCONFIG_APPLICATION}`
        + `/environments/${process.env.APPCONFIG_ENVIRONMENT}`
        + `/configurations/${process.env.APPCONFIG_CONFIGURATION}`;

    return await getAppConfig(url);
}

async function getOneFlag(flagName) {
    let appconfigPort = 2772;

    const url = `http://localhost:${appconfigPort}`
        + `/applications/${process.env.APPCONFIG_APPLICATION}`
        + `/environments/${process.env.APPCONFIG_ENVIRONMENT}`
        + `/configurations/${process.env.APPCONFIG_CONFIGURATION}`
        + `?flag=${flagName}`;

    return await getAppConfig(url);
}

exports.myFunction = async (event) => {
    console.log('starting my function')

    console.log('get all config')
    const configData = await getConfig();
    console.log(configData);

    const parsedConfigData = JSON.parse(configData);
    console.log(parsedConfigData);

    const booleanFlag = await getOneFlag('featureFlagBoolean');
    const parsedBooleanFlag = JSON.parse(booleanFlag)
    console.log(parsedBooleanFlag);

    const attributeFlag = await getOneFlag('featureFlagAttribute');
    const parsedAttributeFlag = JSON.parse(attributeFlag)
    console.log(parsedAttributeFlag);

    // get language
    let language = '';
    if (parsedAttributeFlag.ffString === 'English')
        language = 'EN';
    if (parsedAttributeFlag.ffString === 'Spanish')
        language = 'SPA';
    console.log('language: ' + language);

    //get ammount of exclamation marks
    const exMark ='!';
    const numExMark = parsedAttributeFlag.ffInt
    const endString = exMark.repeat(numExMark);
    console.log('endString: ' + endString); 

    // write result in the right language
    let text = '';
    if(parsedBooleanFlag.enabled) {
        if (language === 'EN')
            text = 'featureFlagBoolean is true ' + endString
        if (language === 'SPA')
            text = 'featureFlagBoolean es verdadero ' + endString
    } else {
        if (language === 'EN')
            text = 'featureFlagBoolean is false ' + endString
        if (language === 'SPA')
            text = 'featureFlagBoolean es falso ' + endString
    }

    console.log('text: ' + text)

    return {
        statusCode: 200,
        body: JSON.stringify(text)
    }
}; 