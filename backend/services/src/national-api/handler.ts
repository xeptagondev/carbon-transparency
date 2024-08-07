// lambda.ts
import { Handler, Context } from 'aws-lambda';
import { Server } from 'http';
import { proxy } from 'aws-serverless-express';
import { NationalAPIModule } from './national.api.module';
import { bootstrapServer } from '../server';

let cachedServer: Server;

export const handler: Handler = async (event: any, context: Context) => {
   const httpBase = '/national'
   cachedServer = await bootstrapServer(cachedServer, NationalAPIModule, httpBase);
   return proxy(cachedServer, event, context, 'PROMISE').promise;
}