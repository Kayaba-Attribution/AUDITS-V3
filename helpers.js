
const fs = require('fs');
const axios = require('axios');
const { ethers } = require('ethers');
const colors = require('colors');

/**
 * Updates JSON data single obeject [DATA & FIELDS must be arrays]
 * @param {array} data - data to be added
 * @param {array} fields - keys where the data will be put
 * @param {string} file - name of the file
 * 
 * ### FUCKING JSON NOT TXT
 */
module.exports.updateJSON = function updateJSON(data, fields, file) {
    if (data.length != fields.length) throw 'data and fields must have the same length'
    // open JSON file
    let rawdata = fs.readFileSync(file);
    let info = ''
    try {
        info = JSON.parse(rawdata);
    } catch (e) {
        console.log("CANT FUCKING READ THE JSON [updateJSON helper]".red)
        try {
            info = JSON.parse(rawdata);
        } catch (e) {
            console.log("CANT FUCKING READ THE JSON AGAIN [updateJSON helper]".red)
            console.log(e)
            process.exit(1)
        }
    }
    // console.log(fields[0])
    // console.log(info[fields[0]])
    for (let i = 0; i < fields.length; i++) {
        if (fields[i] == '') throw 'Field is empty "".'
        if (!(fields[i] in info)) throw `JSON doesnt have key: ${fields[i]}`
        // Delete previous info
        info[fields[i]] = ""
        // Add the data in the same index
        info[fields[i]] = data[i];

    }
    // convert back to JSON
    let json = JSON.stringify(info); //convert it back to json
    // save to the same name (OVERWRITE)
    fs.writeFile(file, json, 'utf8', function (err) {
        if (err) throw err;
        console.log('Scrape Saved To Json');
    }); // write it back
}
//updateJSON(["JUAN", "JD"], ["name", "test"], 'test.json')

module.exports.addAuditJsonData = function addAuditJsonData(data, file) {
    if (data.length != 7) throw 'Missing critacal information'
    // open JSON file
    let rawdata = fs.readFileSync(file);
    let info = ''
    try {
        info = JSON.parse(rawdata);
    } catch (e) {
        console.log("CANT FUCKING READ THE JSON [updateJSON helper]".red)
        try {
            info = JSON.parse(rawdata);
        } catch (e) {
            console.log("CANT FUCKING READ THE JSON AGAIN [updateJSON helper]".red)
            console.log(e)
            process.exit(1)
        }
    }
    moveIMage(data[1])
    let good = true
    info.forEach(e => {
        if (e['name'] == data[0]) {
            good = false
            console.log(`AN AUDIT WITH THE NAME "${data[0]}" ALREADY EXISTS ON AUDITS.JSON`.red)
        }
    })

    if (good) {
        let pck = {
            "name": data[0],
            "logo": data[1],
            "audit": data[2],
            "date": data[3],
            "website": data[4],
            "info": data[5],
            "telegram": data[6],
        }
        // ? add new object to the Json file
        info.unshift(pck)
        //console.log(info)
        console.log(pck)
        //convert back to JSON
        let json = JSON.stringify(info); //convert it back to json
        // save to the same name (OVERWRITE)
        fs.writeFile(file, json, 'utf8', function (err) {
            if (err) throw err;
            console.log('audits.json updated succesfully!'.green);
        }); // write it back
    }
}

function moveIMage(ImgName) {
    ImgName = ImgName.slice(28)
    let destination = '../KISHIELD/assets/images/project-Logos/' + ImgName
    // destination will be created or overwritten by default.
    fs.copyFile('bLogoImage/' + ImgName,  destination, (err) => {
       if(err) throw err;
       console.log(`copied image ${ImgName} succesfully!`)
    });
}

/**
 * Fetch BSC Token Info
 * @param {string} address - address to check
 * @param {bool} flag - print API CALL
 * 
 * response format:
 * status
 * message
 * result
 *  - SourceCode
 *  - ABI
 *  - ContractName
 *  - CompilerVersion
 *  - Runs             #optimizations
 *  - LicenseType
 * 
*/
module.exports.FetchTokenInfo = async function FetchTokenInfo(address,flag_) {
    let flag = false
    flag = flag_
    //if (!ethers.utils.isAddress(address)) throw "CHECK ADDRESS; NOT VALID [FetchTokenInfo]"
    let callABI = "https://api.bscscan.com/api?module=contract&action=getsourcecode&address=" + address + "&apikey=92MM9Q3NG1AHGE21YEHMX6F56VWM6GM3PW.json"
    //let callABI = "https://api-testnet.bscscan.com//api?module=contract&action=getsourcecode&address=" + address + "&apikey=92MM9Q3NG1AHGE21YEHMX6F56VWM6GM3PW.json"
    const response = await axios.get(callABI)
    if(flag) console.log(callABI)
    //console.log(response)
    //console.log(callABI)
    return response.data.result[0]
}
// FetchTokenInfo('0XE5A46BF898CE7583B612E5D168073FF773D7857E').then(e => {
//     console.log(e.Runs)
// })


/*

Returns the function entire function
Checks that the text includes 'function NAME'
calulates the length of 'function NAME'
get the index of 'function NAME'
verify index = 'f' and index + lenggth = 'E'

Iterate over the text and count the number of '{' '}' stop when the amount are equal
be saving the chars over the iteration

*/


module.exports.extractFunction = function extractFunction(_code, _name){
    let includes_name = _code.includes(_name)
    if(includes_name){
        let start_index = _code.indexOf(`function ${_name}`)
        let name_length = `function ${_name}`.length
        if((_code[start_index] !== 'f')) throw "Cant Detect Function Start"
        // console.log(`
        // name_length: ${name_length}
        // start_index: ${start_index}
        // first letter: ${_code[start_index]}
        // last letter: ${_code[(start_index+name_length)-1]}
        // `)

        // we only care of the text after the function
        _code = _code.slice(start_index)

        let clean_function = ''
        let rCurly = 0
        let lCurly = 0
        for (let i = 0; i < _code.length; i++) {
            if(_code[i] == '{') rCurly++;
            if(_code[i] == '}') lCurly++;
            clean_function = clean_function.concat(_code[i])  
            
            if((rCurly === lCurly) && (rCurly !== 0)) break;
        }
        // console.log(rCurly)
        // console.log(lCurly)
        // console.log(clean_function)
        return clean_function
        
    }
}
