import * as github from '../workflows-model';

interface AwsCredentialsStepProps {
  /**
   * @default undefined
   */
  readonly roleToAssume?: string;

  /**
   * @default undefined
   */
  readonly roleExternalId?: string;

  /**
   * @default true
   */
  readonly roleSkipSessionTagging?: boolean;

  /**
   * The GitHub Action role arn, if we are using OIDC to authenticate. The other option
   * to authenticate is with `accessKeyId` and `secretAccessKey`.
   *
   * @default - OIDC not used and `accessKeyId` and `secretAccessKey` are expected.
   */
  readonly gitHubActionRoleArn?: string;

  /**
   * The GitHub Action role session name.
   *
   * @default - no role session name passed into aws creds step
   */
  readonly roleSessionName?: string;

  /**
   * The GitHub Action role session duration.
   *
   * @default - no role session duration passed into aws creds step
   */
  readonly roleDurationSeconds?: number;

  /**
   * The GitHub Action mask AWS Account ID setting.
   *
   * @default - no mask AWS Account ID setting is passed into aws creds step
   */
  readonly maskAwsAccountId?: boolean;

  /**
   * The AWS Region.
   */
  readonly region: string;

  /**
   * To authenticate via GitHub secrets, at least this and `secretAccessKey` must
   * be provided. Alternatively, provide just an `oidcRoleArn`.
   *
   * @default undefined
   */
  readonly accessKeyId?: string;

  /**
   * To authenticate via GitHub secrets, at least this and `accessKeyId` must
   * be provided. Alternatively, provide just an `oidcRoleArn`.
   *
   * @default undefined
   */
  readonly secretAccessKey?: string;

  /**
   * Provide an AWS session token.
   *
   * @default undefined
   */
  readonly sessionToken?: string;
}

export function awsCredentialStep(stepName: string, props: AwsCredentialsStepProps): github.JobStep {
  const params: Record<string, any> = {};

  params['aws-region'] = props.region;

  if (props.roleDurationSeconds) {
    params['role-duration-seconds'] = props.roleDurationSeconds;
  } else {
    params['role-duration-seconds'] = 30 * 60;
  }
  // Session tagging requires the role to have `sts:TagSession` permissions,
  // which CDK bootstrapped roles do not currently have.
  params['role-skip-session-tagging'] = props.roleSkipSessionTagging ?? true;

  params['aws-access-key-id'] = props.accessKeyId;
  params['aws-secret-access-key'] = props.secretAccessKey;
  if (props.sessionToken) {
    params['aws-session-token'] = props.sessionToken;
  }

  if (props.maskAwsAccountId || props.maskAwsAccountId === false) {
    params['mask-aws-account-id'] = props.maskAwsAccountId;
  }

  if (props.roleToAssume) {
    params['role-to-assume'] = props.roleToAssume;
  }
  if (props.roleExternalId) {
    params['role-external-id'] = props.roleExternalId;
  }

  if (props.roleSessionName) {
    params['role-session-name'] = props.roleSessionName;
  }

  return {
    name: stepName,
    uses: 'aws-actions/configure-aws-credentials@v1-node16',
    with: params,
  };
}
