import Header from './components/headerfiles/Header.jsx';
import About from './components/About.jsx';
import Work from './components/Work.jsx';
import Gallery from './components/Gallery.jsx';

import Feat_Tutorials from './components/Feat_Tutorials.jsx';
import Feat_Articles from './components/Feat_Articles.jsx';

import Footer from './components/footer.jsx';
import Signup from './components/headerfiles/signup.jsx';
import Post from './components/posts/post.tsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext.jsx';




function Home() {
  return (
    <>
      
      <About />
      <Work />
      <Gallery />
      <Feat_Articles />
      <Feat_Tutorials />

     
    </>
  );

}

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
    <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/post" element={<Post />} />
      </Routes>
       <Footer />
    </AuthProvider>
    </BrowserRouter>

  );

}

export default App;
