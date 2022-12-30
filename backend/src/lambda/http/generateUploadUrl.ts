import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/attachmentUtil'
import { TodosAccess } from '../../helpers/todosAcess';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';

const logger = createLogger('attachment');

const todosAccess = new TodosAccess()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Event notification: ', event);
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event);
    const dbUrl: string = `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`;
    const presignedURL = createAttachmentPresignedUrl(todoId);

    logger.info('Call updateAttachForTodo: ', presignedURL);
    await todosAccess.updateAttachForTodo(todoId, userId, dbUrl);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        "presignedURL": presignedURL
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
