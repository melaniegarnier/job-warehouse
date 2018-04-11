/*
	Express client test.
	Trying to request as fast as possible the database to test the sturdiness
	using express connection.
*/

// Required packages
import program = require('commander');
import request = require('request');
// Required modules
import * as types from '../types/index';
import {logger, setLogLevel} from '../lib/logger';

let portExpress: number;
let serverAddress: string;

// Commander package part
program
  .option('-v, --verbosity <logLevel>', 'Set log level (debug, info, success, warning, error, critical)', setLogLevel)
  .option('-x, --express <port>', 'Specified the port for express connection', 7687)
  .option('-u, --urlserver <address>', 'Specified the warehouse server url, default is "http://localhost"', "http://localhost")
  .parse(process.argv);


portExpress = program.express;
serverAddress = program.urlserver;

let urlExpress: string = `${serverAddress}:${portExpress}`

// constraints for testing
let constraints: types.jobSerialConstraints = {
	"script": null, "scriptHash": "7b8459fdb1eee409262251c429c48814",
	"inputHash": {
		"file1.inp": "7726e41aaafd85054aa6c9d4747dec7b"
	},
}

let jobID_Test: types.jobSerialInterface = {
	"script":"/Users/vreymond/Stage/Projet/ms-warehouse/run_hex.sh",
	"exportVar": {
		"hexFlags":" -nocuda -ncpu 16 ",
		"hexScript":"/software/mobi/hex/8.1.1/exe/hex8.1.1.x64"
	},
	"modules": ["naccess","hex"],
	"tagTask":"hex",
	"scriptHash" : "e50328c5-dc7f-445d-a5ef-449f4c4b9425",
	"inputHash" : {
		"file1.inp" : "5e2599cd-a22d-4c79-b5cb-4a6fd6291349",
	}
}

/*
* function createJobByExpress that will check if job already exist inside the coiuchDB database before creating it.
* @constraints : constraints we want to check
*/
function createJobByExpress(constraints: types.jobSerialConstraints){
	request({
		url: `${urlExpress}/pushConstraints`,
		method: 'POST',
		body: constraints,
		json: true
	}, function(error: any, response:any, body:any){
		logger.log('info', `Message receive from server \n ${JSON.stringify(body)}`)
	});
}

/*
* function onJobComp that simulate a completed job that we want to store into the couchDB database
* @data : data to store
*/
function onJobComp(data: types.jobSerialInterface) {
	request({
		url: `${urlExpress}/storeJob`,
		method: 'POST',
		body: jobID_Test,
		json: true
	}, function(error: any, response:any, body:any){
		logger.log('info', `Message receive from server \n ${JSON.stringify(body)}`)
	});
}


setInterval(function(){
	createJobByExpress(constraints);
},500)

setInterval(function(){
	onJobComp(jobID_Test);
},500)
