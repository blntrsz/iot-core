import * as cdk from "aws-cdk-lib";
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { CfnAuthorizer } from "aws-cdk-lib/aws-iot";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsSdkCall,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

export class IotCoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authorizerFn = new NodejsFunction(this, "auth-iot", {
      environment: {
        ACCOUNT: props?.env?.account ?? "",
        REGION: props?.env?.region ?? "",
      },
    });

    const authorizer = new CfnAuthorizer(this, "authorizer", {
      status: "ACTIVE",
      authorizerName: "authorizer",
      authorizerFunctionArn: authorizerFn.functionArn,
      signingDisabled: true,
    });

    authorizerFn.addPermission("IOTPermission", {
      principal: new ServicePrincipal("iot.amazonaws.com"),
      sourceArn: authorizer.attrArn,
      action: "lambda:InvokeFunction",
    });

    const describeEndpointRole = new Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    describeEndpointRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );

    describeEndpointRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: ["iot:DescribeEndpoint"],
      }),
    );

    const describeEndpointSdkCall: AwsSdkCall = {
      service: "Iot",
      action: "describeEndpoint",
      parameters: {
        endpointType: "iot:Data-ATS",
      },
      region: props?.env?.region,
      physicalResourceId: PhysicalResourceId.of("IoTEndpointDescription"),
    };

    const describeEndpointResource = new AwsCustomResource(this, "Resource", {
      onCreate: describeEndpointSdkCall,
      onUpdate: describeEndpointSdkCall,
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      role: describeEndpointRole,
    });

    new cdk.CfnOutput(this, "iot url", {
      value: describeEndpointResource.getResponseField("endpointAddress"),
    });
  }
}
