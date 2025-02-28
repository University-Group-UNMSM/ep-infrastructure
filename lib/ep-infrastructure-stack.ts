import { Construct } from "constructs";
import { ConfigProps, getConfig, STAGE } from "./config";
import { Stack, StackProps } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  Table,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import { LambdaFunctionResource } from "./resources/LambdaFunctionResource";
import { CorsHttpMethod, HttpApi } from "aws-cdk-lib/aws-apigatewayv2";

export type EpInfrastructureStackStackProps = StackProps & {
  projectName: string;
  config: Readonly<ConfigProps>;
};

export class EpInfrastructureStack extends Stack {
  public projectName: string;
  public stage: STAGE;

  constructor(
    scope: Construct,
    id: string,
    props: EpInfrastructureStackStackProps
  ) {
    super(scope, id, props);

    const config = getConfig();

    this.projectName = props.projectName;
    this.stage = config.STAGE;

    const httpApi = new HttpApi(this, "HttpApi", {
      apiName: `${this.stage}-${this.projectName}-http-api`,
      createDefaultStage: true,
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.ANY],
        allowHeaders: ["*"],
      },
    });

    const emprendeMasTable = new Table(this, "EmprendeMasTable", {
      tableName: `${this.stage}-${this.projectName}-table`,
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    emprendeMasTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "sk", type: AttributeType.STRING },
      sortKey: { name: "gsi1-sk", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    emprendeMasTable.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "sk", type: AttributeType.STRING },
      sortKey: { name: "gsi2-sk", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    emprendeMasTable.addGlobalSecondaryIndex({
      indexName: "GSI3",
      partitionKey: { name: "sk", type: AttributeType.STRING },
      sortKey: { name: "gsi3-sk", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    emprendeMasTable.addGlobalSecondaryIndex({
      indexName: "GSI4",
      partitionKey: { name: "sk", type: AttributeType.STRING },
      sortKey: { name: "gsi4-sk", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    const registerUserLambdaFunction = new LambdaFunctionResource(this, {
      functionName: "registerUser",
    });

    const loginLambdaFunction = new LambdaFunctionResource(this, {
      functionName: "login",
    });

    emprendeMasTable.grantReadWriteData(registerUserLambdaFunction.role);
    emprendeMasTable.grantReadWriteData(loginLambdaFunction.role);

    this.exportValue(httpApi.apiId, {
      name: `${this.stage}-${this.projectName}-http-api-id`,
    });
  }
}
