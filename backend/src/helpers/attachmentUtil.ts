import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('S3 Attachment')

const AWSXRaySDK = require('aws-xray-sdk')

const DATAWS = AWSXRaySDK.captureAWS(AWS)

const s3 = new DATAWS.S3({
  signatureVersion: 'v4'
})


export async function deleteAttachment(todoId: string) {

  try {

    const bucket_param = {
      Bucket: process.env.ATTACHMENT_S3_BUCKET,
      Key: todoId
    }


    await s3.headObject(bucket_param).promise()


    logger.info('The file is already existed in S3')
    try {
      await s3.deleteObject(bucket_param).promise()
      logger.info('File was deleted')
    } catch (err) {
      logger.info(
        'Exception when delete file with error : ' + JSON.stringify(err)
      )
    }
  } catch (err) {
    logger.info('File is not existed: ' + err.code)
  }
}

export function createAttachmentPresignedUrl(todoId: string): string {

  logger.info(`Call createAttachmentPresignedUrl with todoId=${todoId}`)


  const bucket_param = {
    Bucket: process.env.ATTACHMENT_S3_BUCKET,
    Key: todoId,
    Expires: Number(process.env.SIGNED_URL_EXPIRATION)
  }


  logger.info('Params: ', bucket_param)

  
  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: process.env.ATTACHMENT_S3_BUCKET,
    Key: todoId,
    Expires: Number(process.env.SIGNED_URL_EXPIRATION)
  })


  logger.info(`Get signUrl=${signedUrl}, todoId=${todoId}`)


  return signedUrl as string
}
