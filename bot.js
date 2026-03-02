const node_kakao = require('node-kakao');
const fs = require('fs');
const express = require('express');
const keepAlive = require('./server.js');
const { TalkClient, AuthApiClient, xvc, KnownAuthStatusCode, util, AttachmentApi } = require("node-kakao");
const view_all = ('\u200e'.repeat(500));

const DEVICE_TYPE = "tablet";
let DEVICE_UUID = "";
const DEVICE_NAME = "ChatBot";
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
let client = new node_kakao.TalkClient();


client.on('error', (err) => {
    console.log(`클라이언트 에러 발생\n오류: ${err.stack}`);
});

client.on('disconnected', (reason) => {
    console.log(`연결이 끊어졌습니다.\n사유: ${reason}`);
});

async function registerDevice(authClient) {
    let requestData = await authClient.requestPasscode({"email": EMAIL, "password": PASSWORD, "forced": true});
    if (!requestData.success) {
    return {"success": false, "message": `RequestPasscode Failed! Data: ${JSON.stringify(requestData, null, 2)}`};
    } else {
        let readline = require("readline");
        let inputInterface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        let passcode = await new Promise((resolve) => inputInterface.question("Enter passcode: ", resolve));
        inputInterface.close();
        let registerData = await authClient.registerDevice({"email": EMAIL, "password": PASSWORD, "forced": true}, passcode, true);
        if (!registerData.success) {
            return {"success": false, "message": `RegisterDevice Failed! Data: ${JSON.stringify(registerData, null, 2)}`};
        }
        return {"success": true};
    }
}

async function login() {
    let config = { countryIso: "KR", language: "ko" };
    if (DEVICE_UUID === "") {
        if (DEVICE_TYPE === "pc") {
            DEVICE_UUID = util.randomWin32DeviceUUID();
        }
        if (DEVICE_TYPE === "tablet") {
            DEVICE_UUID = util.randomAndroidSubDeviceUUID();
        }
        console.log(`uuid: ${DEVICE_UUID}`);
    }
    let authClient = await AuthApiClient.create(DEVICE_NAME, DEVICE_UUID, config, xvc.AndroidSubXVCProvider);
    let loginData = await authClient.login({"email": EMAIL, "password": PASSWORD, "forced": true});
    if (!loginData.success) {
        if (loginData.status === KnownAuthStatusCode.DEVICE_NOT_REGISTERED) {
            let result = await registerDevice(authClient);
            if (!result.success) {
                console.log(result.message);
            } else {
                login();
            }
        } else {
            console.log(`Login Failed! Data: ${JSON.stringify(loginData, null, 2)}`);
        }
    } else {
        let loginRes = await client.login(loginData.result);
        if (!loginRes.success) {
            console.log(`Login Failed! loginResult: ${JSON.stringify(loginRes, null, 2)}`);
        } else {
            token = `${loginData.result.accessToken}-${loginData.result.deviceUUID}`;
            console.log(`Login Success!`);
        }
    }
}

keepAlive();
login().then();