import Link from 'next/link';
import { PrismicProvider } from '@prismicio/react';
import { AppProps } from 'next/app';
import { linkResolver, repositoryName } from '../services/prismic';
import { PrismicPreview } from '@prismicio/next';

import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  // console.log(linkResolver);
  return (

    <PrismicProvider
      linkResolver={linkResolver}
      internalLinkComponent={({ href, children, ...props }) => (
      <Link href={href}>
        <a {...props}>
          {children}
        </a>
      </Link>
    )}>

      <PrismicPreview repositoryName={repositoryName}>
          <Component {...pageProps} />
      </PrismicPreview>

    </PrismicProvider>
  )



}

export default MyApp;
