#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { EpInfrastructureStack } from "../lib/ep-infrastructure-stack";
import { getConfig } from "../lib/config";

const config = getConfig();

const app = new cdk.App();

const commonProperties = {
  env: { account: config.AWS_ACCOUNT_ID, region: config.AWS_REGION },
  config,
};

const projectName = "emprende-mas";

new EpInfrastructureStack(app, "EpInfrastructureStack", {
  ...commonProperties,
  projectName,
});
