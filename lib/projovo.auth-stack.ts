import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  UserPool,
  UserPoolClient,
  UserPoolGroup,
} from "aws-cdk-lib/aws-cognito";
import {
  IdentityPool,
  UserPoolAuthenticationProvider,
} from "aws-cdk-lib/aws-cognito-identitypool";
import { Construct } from "constructs";

export class ProjovoAuthStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.userPool = new UserPool(this, "ProjovoUserPool", {
      userPoolName: "terranexa-dev-projovo-user-pool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireSymbols: true,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: false,
      },
      removalPolicy: RemovalPolicy.DESTROY, // change to RETAIN in prod
    });

    this.userPoolClient = new UserPoolClient(this, "ProjovoUserPoolClient", {
      userPool: this.userPool,
      userPoolClientName: "terranexa-dev-projovo-user-pool-client",
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30),
    });

    const groupNames = ["admin", "agency-member", "client-member"];

    groupNames.forEach((groupName) => {
      new UserPoolGroup(this, `Group-${groupName}`, {
        groupName,
        userPool: this.userPool,
      });
    });

    const identityPool = new IdentityPool(this, "ProjovoIdentityPool", {
      identityPoolName: "terranexa-dev-projovo-user-pool-client-identity-pool",
      allowUnauthenticatedIdentities: false,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({ userPool: this.userPool }),
        ],
      },
    });
  }
}
