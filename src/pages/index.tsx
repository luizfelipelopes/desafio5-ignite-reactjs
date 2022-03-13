import Link from 'next/link';
import Prismic from "@prismicio/client";
import { getPrismicClient } from '../services/prismic';
import { AiOutlineCalendar } from "react-icons/ai"
import { FiUser } from "react-icons/fi"
import { format } from "date-fns";
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect, useState } from 'react';

import Header from '../components/Header';

import stylesCustom from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  useEffect(() => {

        const postsResults = postsPagination.results.map(post => ({

        uid: post.uid,
        first_publication_date: format(new Date(post.first_publication_date), "dd MMM yyyy", {locale: ptBR}),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author:  post.data.author,
        }

      }
      ));

      setPosts(postsResults);

  }, []);

  async function loadMorePosts() {

    if(nextPage){

      const data = await fetch(postsPagination.next_page)
      .then(response => response.json())
      .catch(error => console.log(error));

      const prismicNextPage = data.next_page;

      const newPosts = data.results.map(post => {

        return {
          uid: post.uid,
          first_publication_date: format(new Date(post.first_publication_date), "dd MMM yyyy", {locale: ptBR}),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author:  post.data.author,
          },

        }

      });

      const arrayPosts: Post[] = [...posts].concat(newPosts);

      setNextPage(prismicNextPage);
      setPosts(arrayPosts);

    }

  }

  return (
    <>

    <div className={stylesCustom.container}>
      <div className={stylesCustom.content}>
          <header>
            <Header />
          </header>

          <div className={stylesCustom.posts}>
          {posts.map(post => (
          <div key={post.uid}>
            <Link href={`post/${post.uid}`}>
              <a href='#' key={post.uid}>
                <h1>{post.data.title}</h1>
              </a>
            </Link>
            <p>{post.data.subtitle}</p>
            <AiOutlineCalendar /> <span>{post.first_publication_date}</span>
            <FiUser /> <span>{post.data.author}</span>
          </div>
          ))}
          </div>

          {nextPage && (
            <a href='#' className={styles.morePosts} onClick={() => loadMorePosts()}>Carregar mais posts</a>
          )}

      </div>
    </div>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
    ],{
      fetch: ['posts.title', 'posts.subtitle', 'posts.subtitle', 'posts.author', 'posts.banner', 'posts.content'],
      pageSize: 1,

    }

  );

  const posts = postsResponse.results.map(post => {

    return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author:  post.data.author,
      },

    }

  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }
};
