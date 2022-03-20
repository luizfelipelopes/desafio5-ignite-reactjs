import * as prismic from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';
import { NextApiRequest } from 'next';

export const repositoryName = 'desafio5js';

export function getPrismicClient(req?: unknown) {
  const prismicRes = prismic.createClient(process.env.PRISMIC_API_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  });

  prismicRes.enableAutoPreviewsFromReq(req);

  return prismicRes;
}

export function linkResolver(doc) {
  switch (doc.type) {
    case 'homepage':
      return '/'
    case 'posts':
      return `/post/${doc.uid}`
    default:
      return null
  }
}

type ConfigProps = {
  previewData?: any;
  req?: NextApiRequest;
}

export function createClient(config = {} as ConfigProps) {
  const client = prismic.createClient(process.env.PRISMIC_API_ENDPOINT, {
      ...config,
      accessToken: process.env.PRISMIC_ACCESS_TOKEN
  })

  enableAutoPreviews({
      client,
      previewData: config.previewData,
      req: config.req,
  })

  return client;
}