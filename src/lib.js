import React from 'react';
import axios from "axios";
import pako from 'pako';
import queryString from 'query-string';
import {createBrowserHistory} from 'history'

export function generateFmsJsonUrl(url, mod) {
    let baseUrl = 'https://download.alliancegenome.org/';
    let correctUrl = url.replace(/WB/g, mod);
    return (baseUrl + correctUrl);
}

export function generateDateString(time) {
    let dateObject = new Date(time);
    let year = dateObject.getFullYear().toString();
    let month = (dateObject.getMonth() + 1).toString();
    if (month < 10) { month = '0' + month; }
    let day = dateObject.getDate().toString();
    if (day < 10) { day = '0' + day; }
    let hour = dateObject.getHours().toString();
    if (hour < 10) { hour = '0' + hour; }
    let minute = dateObject.getMinutes().toString();
    if (minute < 10) { minute = '0' + minute; }
    let second = dateObject.getSeconds().toString();
    if (second < 10) { second = '0' + second; }
    let date = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    return date;
}

export function renderOption(label, value) {
    return(<option key={label} value={value}>{label}</option>);
}

export function getHtmlVar() { return new URLSearchParams(window.location.search); }

export const getS3PathsFromFms = (testOrLive, mod) => {
    return new Promise((resolve, reject) => {
        let urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-JSON/' + mod + '?latest=false';
        let releaseType = 'release/stage';
        if (testOrLive === 'test') {
            urlRelease = 'https://fms.alliancegenome.org/api/datafile/by/GENE-DESCRIPTION-TEST-JSON/' + mod + '?latest=false';
            releaseType = 'pre-release/build';
        }
        fetch(urlRelease)
            .then(responseRelease => responseRelease.json())
            .then(responseRelease => {
                resolve(responseRelease.map(res => {
                    return {
                        releaseVersion: res.releaseVersions.sort((a, b) => a.releaseVersion > b.releaseVersion ? 1 : -1)[0].releaseVersion,
                        releaseType: releaseType,
                        uploadDate: generateDateString(res.uploadDate),
                        s3Path: res.s3Path
                    }
                }));
            });
    });
}

export const requestAndGunzipBodyIfNecessary = (url) => {
    return new Promise((resolve, reject) => {
        let config = {};
        if (url.endsWith(".gz")) {
            config = { responseType: 'arraybuffer' }
        }
        axios.get(url, config)
            .then(function (response) {
                if (response.headers['content-type'] === 'application/x-gzip') {
                    resolve(JSON.parse(pako.inflate(response.data, {to: 'string'})));
                } else {
                    resolve(response.data);
                }
            })
            .catch(function (error) {
                reject(error);
            });
    })
}

function preserveQueryParameters(history, preserve, location) {
    const currentQuery = queryString.parse(history.location.search);
    if (currentQuery) {
        const preservedQuery = {};
        for (let p of preserve) {
            const v = currentQuery[p];
            if (v) {
                preservedQuery[p] = v;
            }
        }
        if (location.search) {
            Object.assign(preservedQuery, queryString.parse(location.search));
        }
        location.search = queryString.stringify(preservedQuery);
    }
    return location;
}

function createLocationDescriptorObject(location, state) {
    return typeof location === 'string' ? { pathname: location, state } : location;
}

function createPreserveQueryHistory(createHistory, queryParameters) {
    return (options) => {
        const history = createHistory(options);
        const oldPush = history.push, oldReplace = history.replace;
        history.push = (path, state) => oldPush.apply(history, [preserveQueryParameters(history, queryParameters, createLocationDescriptorObject(path, state))]);
        history.replace = (path, state) => oldReplace.apply(history, [preserveQueryParameters(history, queryParameters, createLocationDescriptorObject(path, state))]);
        return history;
    };
}

export const history = createPreserveQueryHistory(createBrowserHistory, ['locale', 'token', 'returnTo'])();

