import { Construct } from "constructs";
import { ConfigProps, getConfig, STAGE } from "./config";
import { Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, ProjectionType } from "aws-cdk-lib/aws-dynamodb";
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

    const userTable = new Table(this, "UserTable", {
      tableName: `${this.stage}-${this.projectName}-user-table`,
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    userTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "email", type: AttributeType.STRING },
      sortKey: { name: 'pk', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    const registerUserLambdaFunction = new LambdaFunctionResource(this, {
      functionName: "registerUser",
    });

    const loginLambdaFunction = new LambdaFunctionResource(this, {
      functionName: 'login'
    })

    userTable.grantReadWriteData(registerUserLambdaFunction.role);
    userTable.grantReadWriteData(loginLambdaFunction.role);

    this.exportValue(httpApi.apiId, {
      name: `${this.stage}-${this.projectName}-http-api-id`,
    });
  }
}
