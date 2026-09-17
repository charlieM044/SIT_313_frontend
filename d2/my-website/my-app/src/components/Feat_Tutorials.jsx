import { useState } from 'react';

const tutorials = [
    {
        id: 1,
        title: 'Tutorial 1',
        description: 'This is the description for Tutorial 1.',
        score: 5,
        author: 'John Dog',
        Img: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
    {
        id: 2,
        title: 'Tutorial 2',
        description: 'This is the description for Tutorial 2.',
        score: 4,
        author: 'Smithers Smith',
        Img: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
    {
        id: 3,
        title: 'Tutorial 3',
        description: 'This is the description for Tutorial 3.',
        score: 3,
        author: 'Bobson',
        Img: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
    {
        id: 4,
        title: 'Tutorial 4',
        description: 'This is the description for Tutorial 4.',
        score: 5,
        author: 'Brothford',
        Img: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    }
]

function Tutorials() {

     const [visibleCount, setVisibleCount] = useState(3);
    
        const handleSeeMore = () => {
            setVisibleCount((count) => count + 3);
        };
    
        const visibleArticles = tutorials.slice(0, visibleCount);
        const hasMore = visibleCount < tutorials.length;
    
    
    return (
        <section className="tutorials-section">
            <div className="tutorials-text">
                <h1>Featured tutorials</h1>
            </div>

            <ul className="featured-tutorials">
                {visibleArticles.map((tutorial) => (
                    <li key={tutorial.id}>
                        <article className="featured-tutorial">
                            <h2>{tutorial.title}</h2>
                            <p>{tutorial.description}</p>
                            <img src={tutorial.Img} alt={tutorial.title} />
                            <p>Score: {tutorial.score}</p>
                            <p>Author: {tutorial.author}</p>
                        </article>
                    </li>
                ))}
            </ul>

            {hasMore && (
                <div className="see-more-form">
                    <button type="button" onClick={handleSeeMore}>
                        See More Tutorials
                    </button>
                </div>
            )}

        </section>
    );
}

export default Tutorials;