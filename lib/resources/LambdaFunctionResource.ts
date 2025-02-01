import { CfnOutput } from "aws-cdk-lib";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";

import type { EpInfrastructureStack } from "../ep-infrastructure-stack";

export class LambdaFunctionResource {
  public readonly logGroup: LogGroup;
  public readonly role: Role;

  constructor(
    stack: EpInfrastructureStack,
    props: { functionName: string; runInsideVpc?: boolean }
  ) {
    const functionNameForIds =
      props.functionName.charAt(0).toUpperCase() + props.functionName.slice(1);
    const functionNameForExport = props.functionName.replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`
    );

    this.logGroup = new LogGroup(
      stack,
      `CloudWatchLogGroup${functionNameForIds}`,
      {
        logGroupName: `/aws/lambda/${stack.stage}-${stack.projectName}-${functionNameForExport}`,
        retention: RetentionDays.ONE_MONTH,
      }
    );

    this.role = new Role(stack, `RoleLambdaFunction${functionNameForIds}`, {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com").grantPrincipal,
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        ...(props.runInsideVpc
          ? [
              ManagedPolicy.fromAwsManagedPolicyName(
                "service-role/AWSLambdaVPCAccessExecutionRole"
              ),
            ]
          : []),
      ],
    });

    this.logGroup.grantWrite(this.role);

    new CfnOutput(
      stack,
      "OutputRoleLambdaFunction" + functionNameForIds + "Arn",
      {
        value: this.role.roleArn,
        exportName: `${stack.stage}-${stack.projectName}-role-lambda-function-${functionNameForExport}-arn`,
      }
    );
  }
}
