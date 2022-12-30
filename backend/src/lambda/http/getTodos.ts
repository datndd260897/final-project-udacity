import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userIdTodo = getUserId(event);
    logger.info("Call getTodosForUser with userId", userIdTodo)
    //Get Todos for currentuser
    const res = await getTodosForUser(userIdTodo);

    return {
      statusCode: 200,
      body: JSON.stringify({
        "items": res
      })
    }
  }
)


handler
  .use(httpErrorHandler()) //Call
  .use( //use
  cors({
    credentials: true //credentials
  })
)
