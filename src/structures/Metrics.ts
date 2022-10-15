import process from 'node:process';
import type { CloudWatchClientConfig} from '@aws-sdk/client-cloudwatch';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { logger } from '#util/logger.js';

export const enum Metrics {
    CommandsExecuted = 'commands_executed',
}

export const config = {
    [Metrics.CommandsExecuted]: ['command', 'guild', 'user', 'shard', 'arg:word', 'arg:limit', 'arg:starts-with', 'arg:ends-with'],
} as const;

export class MetricsHandler {
    protected namespace = 'thoth';

    protected readonly environment = process.env.NODE_ENV;

    protected configuration?: CloudWatchClientConfig;

    private client: CloudWatchClient = new CloudWatchClient({ region: process.env.AWS_REGION });

    public async publish<T extends Metrics>(metric: T, dimensions: Record<string, string>, count?: number): Promise<void> {
        try {
            const command = new PutMetricDataCommand({
                MetricData: [{
                    MetricName: metric,
                    Dimensions: [{
                        Name: 'Environment',
                        Value: this.environment,
                    }, ...Object.entries(dimensions).map(([name, value]) => ({ Name: name, Value: value }))],
                    Unit: 'None',
                    Timestamp: new Date(),
                    Value: count ? count : 1,
                }],
                Namespace: this.namespace,
            });

            await this.client.send(command);
        } catch (error) {
            logger.warn('Failed to publish metric ', error);
            
        }

    }
}