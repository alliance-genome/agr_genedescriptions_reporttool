import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AmplifyProductionStack extends cdk.Stack {

  constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const main_paths = [
      { source: '/<*>',                                target: '/index.html',                                                                         status: amplify.RedirectStatus.NOT_FOUND_REWRITE },
      { source: '</^[^.]+$/>',                         target: '/index.html',                                                                         status: amplify.RedirectStatus.REWRITE }
    ];

    const amplifyApp = new amplify.App(this, 'agr-genedescriptions-reporttool', {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'alliance-genome',
        repository: 'agr_genedescriptions_reporttool',
        oauthToken: cdk.SecretValue.secretsManager('GithubOauthDevopsToken'),
      }),
      autoBranchCreation: {
        patterns: ['SCRUM-*'],
      },
      autoBranchDeletion: true,
      role: iam.Role.fromRoleArn(this, "AmplifyALBRole", 'arn:aws:iam::100225593120:role/StageAmplifyRole'),
    });

    amplifyApp.addEnvironment("NODE_ENV", "production");

    const main = amplifyApp.addBranch('master', { autoBuild: true, branchName: 'master', stage: 'PRODUCTION' });

    const domain = amplifyApp.addDomain('alliancegenome.org', {
      enableAutoSubdomain: true, // in case subdomains should be auto registered for branches
      autoSubdomainCreationPatterns: ['scrum-*'], // regex for branches that should auto register subdomains                                          
    }); 
 
    domain.mapSubDomain(main, 'reporttool');

    for(let path of main_paths) {
      amplifyApp.addCustomRule({
        source: path.source,
        target: path.target,
        status: path.status
      });
    }

  }
}
