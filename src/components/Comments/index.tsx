import { useEffect } from "react";
import styles from "./comments.module.scss";

export function Comments() {

    function insertComments() {

        const script = document.createElement('script');
        const anchor = document.getElementById('inject-comments-for-uterances');
        script.setAttribute('src', 'https://utteranc.es/client.js');
        script.setAttribute('crossorigin', 'anonymous');
        script.setAttribute('async', 'true');
        script.setAttribute('repo', 'luizfelipelopes/desafio5-ignite-reactjs');
        script.setAttribute('issue-term', 'comments');
        script.setAttribute('theme', 'github-dark-orange');

        if(anchor.children.length <= 0){
            anchor.appendChild(script);
        }

    }


    useEffect(() => {
        insertComments();
    }, []);

    return(
        <div className={styles.container} id="inject-comments-for-uterances" />
    )
}