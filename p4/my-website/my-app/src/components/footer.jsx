




function Footer() {
  return (
    <div className="footer-content">
      <div className="footer-section-explore">
        <h2>explore</h2>
       
        <p>
          <a href="#Home">Home</a>
        </p>
        <p>
          <a href="#Articles">Articles</a>
        </p>
        <p>
          <a href="#tutorials">Tutorials</a>
        </p>

      </div>
      <div className="footer-section-contact">
        <h2>contact</h2>
        <p>
          <a href="mailto:charliemason044@gmail.com">
            charliemason044@gmail.com
          </a>
        </p>
      </div>
      <div className="footer-section-social">
        <h2>social</h2>
        <p>
          <a href="https://www.linkedin.com/in/charlie-mason-0b4a1b1b3/" target="_blank" rel="noopener noreferrer">
            <img src="/assets/icons/bat.png" alt="LinkedIn icon" className="social-icon" />
          </a>
        </p>
        <p>
          <a href="https://twitter.com/charliemason" target="_blank" rel="noopener noreferrer">
            <img src="/assets/icons/troll.png" alt="Twitter icon" className="social-icon" />
          </a>
        </p>
        <p>
          <a href="https://github.com/charliemason" target="_blank" rel="noopener noreferrer">
            <img src="/assets/icons/dino.jpg" alt="GitHub icon" className="social-icon" />
          </a>
        </p>
      </div>
      <div className="footer-section-legal">
        <h2>legal</h2>
        <p>
          <a href="#">Privacy Policy</a>
        </p>
        <p>
          <a href="#">Terms of Service</a>
        </p>

      </div>

    </div>

  );
}

export default Footer;
