import NewsletterForm from './NewsletterForm.jsx';

function Header() {
  return (
    <header>
      <nav aria-label="Primary navigation">
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#work">Work</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <NewsletterForm />
      </nav>

      <section className="banner" aria-label="Banner">
        <img src="/banner.webp" alt="Scenic banner" />
        <div className="banner-bar">my name charlie</div>
      </section>
    </header>
  );
}

export default Header;
