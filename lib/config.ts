import * as dotenv from "dotenv";
import path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export enum STAGE {
  DEV = "dev",
  TEST = "test",
  PROD = "prod",
}

export type ConfigProps = {
  STAGE: STAGE;
  AWS_REGION: string;
  AWS_ACCOUNT_ID: string;
};

export const getConfig = (): ConfigProps => {
  return {
    STAGE: (process.env.STAGE as STAGE) ?? STAGE.DEV,
    AWS_REGION: process.env.AWS_REGION ?? "",
    AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID ?? "us-east-1",
  };
};
