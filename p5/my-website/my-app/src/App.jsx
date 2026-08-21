import Header from './components/headerfiles/Header.jsx';
import About from './components/About.jsx';
import Work from './components/Work.jsx';
import Gallery from './components/Gallery.jsx';

import Feat_Tutorials from './components/Feat_Tutorials.jsx';
import Feat_Articles from './components/Feat_Articles.jsx';

import Footer from './components/Footer.jsx';
import Signup from './components/headerfiles/signup.jsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
    <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
       <Footer />
    </BrowserRouter>

  );

}

export default App;
