//import NewsletterForm from './NewsletterForm.jsx';
import { useState } from 'react';
import SearchBar from './search.jsx';
import Login from './login.jsx';
import Signup from './signup.jsx';
import { useNavigate } from 'react-router-dom';
import NewsletterForm from './NewsletterForm.jsx'; // Import the NewsletterForm component


function Header() {
  const [isloggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('authToken')));
  const navigate = useNavigate();
  return (
    <header>

      {/*       
      <nav aria-label="Primary navigation">
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#work">Work</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <NewsletterForm />
      </nav> */}



      <nav aria-label="Primary navigation">
        <section className="search-bar">
          <SearchBar />
        </section>
        <div className="header-actions">
          <NewsletterForm />
          <Login isLoggedIn={isloggedIn} setIsLoggedIn={setIsLoggedIn} />
          {/* {isloggedIn && <button onClick={() => navigate('/post')}>Post</button>}
          {/* {!isloggedIn && <button onClick={() => navigate('/signup')}>Sign Up</button>}*/}

          <button onClick={() => navigate('/post')}>Post</button>
          <button onClick={() => navigate('/pricing')}>Payment Plans</button>
        </div>


      </nav>

      <section className="banner" aria-label="Banner">
        <img src="/banner.webp" alt="Scenic banner" />
        <div className="banner-bar">my name charlie</div>
      </section>
    </header>
  );
}

export default Header;
