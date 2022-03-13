import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { format } from "date-fns";
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from "@prismicio/client";

import Header from '../../components/Header';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';



interface Post {
  first_publication_date: string | null;
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const [newPost, setPost] = useState<Post>(post);
  const [isLoading, setLoading] = useState(true);
  const { isFallback } = useRouter();

  if(!post) return null;

  useEffect(() => {

    const thePost: Post = {
      first_publication_date: format(new Date(post.first_publication_date), "dd MMM yyyy", {locale: ptBR}),
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
  }, []);

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
          </header>
          {newPost.data.content.map(content => (
            <div className={styles.bodyContent} key={content.heading}>
            <h2>{content.heading}</h2>
            <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}} />
          </div>
          ))}

        </section>
      </div>
    </div>
    </>

  );

}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
    ]);

  const paths = posts.results.map(post => ({
    params: { slug: String(post.uid) },
  }));

  return {
      paths,
      fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {

  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
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
        post
      }
  }
};
