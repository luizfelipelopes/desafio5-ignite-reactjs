import { GetStaticPaths, GetStaticProps } from 'next';
import { Router, useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { format } from "date-fns";
import ptBR from 'date-fns/locale/pt-BR';
import * as Prismic from "@prismicio/client";

import Header from '../../components/Header';
import { RichText } from 'prismic-dom';
import { createClient, getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import stylesCommon from '../../styles/common.module.scss';
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';
import { Comments } from '../../components/Comments';
import Link from 'next/link';
import { destroyCookie } from 'nookies';



interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface NavPost {
  uid: string;
  title: string;
}

interface PostProps {
  post: Post;
  preview: boolean;
  previewItem?: NavPost;
  nextItem?: NavPost;
}

export default function Post({ post, preview, previewItem, nextItem }: PostProps) {

  const [newPost, setPost] = useState<Post>(post);
  const [isLoading, setLoading] = useState(true);
  const { isFallback, push, asPath } = useRouter();

  if(!post) return null;

  useEffect(() => {

    const thePost: Post = {
      first_publication_date: format(new Date(post.first_publication_date), "dd MMM yyyy", {locale: ptBR}),
      last_publication_date: format(new Date(post.last_publication_date), "dd MMM yyyy, 'às' HH:mm", {locale: ptBR}),
      data: {
        title: post.data.title,
        banner: {
          url: post.data.banner.url
        },
        author: post.data.author,
        content: post.data.content
      }
    }

    setPost(thePost);
    setLoading(false);
  }, [post]);

  const minutes = newPost.data.content.reduce((acc, content) => {

        let headingCount = content.heading.length;
        let texts = [];

        content.body.map(body => {
          texts = body.text.split(/[ /.]/);
          acc.arrayTexts = acc.arrayTexts.concat(texts);
        });

        acc.arrayTexts = acc.arrayTexts.filter(function(str){
          return /\S/.test(str);
        });

        let bodyCount = acc.arrayTexts.length;
        acc.total += (headingCount + bodyCount);
        acc.time =  Math.ceil(acc.total / acc.words);

    return acc;
  }, {
    arrayTexts: [],
    words: 200,
    total: 0,
    time: 0
  });


  return (
    <>
    {!isFallback && <span className={styles.loading}>Carregando...</span>}
    <div className={styles.container}>
        <header className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <Header />
          </div>
          <div className={styles.banner}>
            <img src={newPost.data.banner.url} alt={newPost.data.title} />
          </div>
        </header>
      <div className={styles.content}>
        <section className={styles.posts}>
          <header>
            <h1>{newPost.data.title}</h1>
            <AiOutlineCalendar /> <span>{newPost.first_publication_date}</span>
            <FiUser /> <span>{newPost.data.author}</span>
            <AiOutlineClockCircle /> <span>{`${minutes.time} min`}</span>
            {newPost.last_publication_date && <p>{`* editado em ${newPost.last_publication_date}`}</p>}
          </header>
          {newPost.data.content.map(content => (
            <div className={styles.bodyContent} key={content.heading}>
            <h2>{content.heading}</h2>
            <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}} />
          </div>
          ))}


          <div className={styles.containerNav}>

            {previewItem?.uid && (
              <div className={styles.navItem}>
              <span>{previewItem.title}</span>
              <Link href={`/post/${previewItem.uid}`}>
                <a>Post anterior</a>
              </Link>
            </div>
            )}

            {nextItem?.uid && (
            <div className={styles.navItem}>
              <span>{nextItem.title}</span>
              <Link href={`/post/${nextItem.uid}`}>
                <a>Próximo post</a>
              </Link>
            </div>
            )}
          </div>

        <Comments />

        {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a className={stylesCommon.exitPreview}>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </section>

      </div>

    </div>

    </>

  );



}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = createClient();
  // const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicate.at('document.type', 'posts')
    ]);

  const paths = posts.results.map(post => ({
    params: { slug: String(post.uid) },
  }));

  return {
      paths,
      fallback: true
  }
};

export const getStaticProps = async ({
  params,
  preview = false,
  previewData
}) => {

  const { slug } = params;

  const prismic = createClient({ previewData });
  const response = await prismic.getByUID('posts', String(slug), {ref: previewData?.ref ?? null});

  const previewPost = await prismic.query([
    Prismic.predicate.at('document.type', 'posts'),
    Prismic.predicate.dateBefore('document.first_publication_date', response.first_publication_date)
    ],{
      fetch: ['posts.title'],
      orderings: {
        field: 'document.first_publication_date',
        direction: 'desc'
      },
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }

  );

  const nextPost = await prismic.query([
    Prismic.predicate.at('document.type', 'posts'),
    Prismic.predicate.dateAfter('document.first_publication_date', response.first_publication_date)
    ],{
      fetch: ['posts.title'],
      orderings: {
        field: 'document.first_publication_date',
        direction: 'asc'
      },
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }

  );

  const previewItem = {
    uid: previewPost?.results[0]?.uid ?? null,
    title: previewPost?.results[0]?.data?.title ?? null
  };

  const nextItem = {
    uid: nextPost?.results[0]?.uid ?? null,
    title: nextPost?.results[0]?.data?.title ?? null
  };

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content

    }
  }

  return {
      props: {
        post,
        preview,
        previewItem,
        nextItem
      }

  }
};

