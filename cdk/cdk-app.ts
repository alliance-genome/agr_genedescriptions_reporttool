#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AmplifyProductionStack } from './amplify-production-stack';

const app = new cdk.App();

new AmplifyProductionStack(app, 'agr-genedescriptions-reporttool', {
  stackName: 'agr-genedescriptions-reporttool'
});
