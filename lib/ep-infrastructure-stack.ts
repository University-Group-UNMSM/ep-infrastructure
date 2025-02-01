import { Construct } from "constructs";
import { ConfigProps, getConfig, STAGE } from "./config";
import { Stack, StackProps } from "aws-cdk-lib";

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
  }
}
