//import NewsletterForm from './NewsletterForm.jsx';
import { useAuth, AuthProvider } from '../context/AuthContext.jsx';
import { auth } from '../../firebase.js';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import SearchBar from './search.jsx';
import Login from './login.jsx';
import NewsletterForm from './NewsletterForm.jsx';
import signup from './signup.jsx';

function Header() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };


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
              <section className="logo">
          <a href="/">
            <img src="/logo.png" alt="Logo" />
          </a>
        </section>
        <section className="search-bar">
          <SearchBar />
        </section>
        <div className="header-actions">
        
          <Login
            isLoggedIn={isLoggedIn}   
            onLogout={handleLogout}
          />
          {/* {isloggedIn && <button onClick={() => navigate('/post')}>Post</button>}
          {/* {!isloggedIn && <button onClick={() => navigate('/signup')}>Sign Up</button>}*/}

          <button onClick={() => navigate('/post')}>Post</button>
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
