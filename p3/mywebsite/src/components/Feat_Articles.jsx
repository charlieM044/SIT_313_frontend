import { useState } from 'react';

const articles = [
    {
        id: 1,
        title: 'Article 1',
        description: 'This is the description for Article 1.',
        score: 5,
        author: 'John Dog',
        articleImg: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
    {
        id: 2,
        title: 'Article 2',
        description: 'This is the description for Article 2.',
        score: 4,
        author: 'Smithers Smith',
        articleImg: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
    {
        id: 3,
        title: 'Article 3',
        description: 'This is the description for Article 3.',
        score: 3,
        author: 'Bobson',
        articleImg: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
    {
        id: 4,
        title: 'Article 4',
        description: 'This is the description for Article 4.',
        score: 5,
        author: 'Brothford',
        articleImg: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
    {
        id: 5,
        title: 'Article 5',
        description: 'This is the description for Article 5.',
        score: 4,
        author: 'smith smitherson',
        articleImg: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    }
];


function Articles() {
    const [visibleCount, setVisibleCount] = useState(3);

    const handleSeeMore = () => {
        setVisibleCount((count) => count + 3);
    };

    const visibleArticles = articles.slice(0, visibleCount);
    const hasMore = visibleCount < articles.length;


    return (
        <section className="Articles" id="Articles">
            <div className="Articles-text">
                <h1>Featured Articles</h1>
            </div>

            <ul className="featured-articles">
                {visibleArticles.map((article) => (
                    <li key={article.id}>
                        <article className="featured-article">
                            <h2>{article.title}</h2>
                            <p>{article.description}</p>
                            <img src={article.articleImg} alt={article.title} />
                            <p>Score: {article.score}</p>
                            <p>Author: {article.author}</p>
                        </article>
                    </li>
                ))}
            </ul>


            {hasMore && (
                <div className="see-more-form">
                    <button type="button" onClick={handleSeeMore}>
                        See More Articles
                    </button>
                </div>
            )}
        </section>
    );
}

export default Articles;