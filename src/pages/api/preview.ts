import { redirectToPreviewURL, setPreviewData } from "@prismicio/next";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient, linkResolver } from "../../services/prismic"

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const client = createClient({ req });
    await setPreviewData({ req, res });
    await redirectToPreviewURL({ req, res, client, linkResolver })
}