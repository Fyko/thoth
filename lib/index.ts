import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { Service, Source } from '@aws-cdk/aws-apprunner-alpha';
import type { App, StackContext } from '@serverless-stack/resources';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';

const thoth = ({ stack }: StackContext) => {
	const image = new DockerImageAsset(stack, 'ThothImage', {
		directory: fileURLToPath(process.cwd()),
	});

	const service = new Service(stack, 'ThothService', {
		source: Source.fromEcr({ repository: image.repository }),
	});

	stack.addOutputs({
		ServiceUrl: service.serviceUrl,
		ServiceArn: service.serviceArn,
	});
};

// eslint-disable-next-line func-names
export default function (app: App) {
	app.setDefaultFunctionProps({
		runtime: 'nodejs16.x',
		srcPath: 'services',
		bundle: {
			format: 'esm',
		},
	});

	app.stack(thoth);
}
