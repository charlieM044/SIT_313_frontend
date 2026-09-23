import profileImage from '../../profile.avif';

function About() {
  return (
    <section className="ME" id="about">
      <div className="imageImage">
        <img src={profileImage} alt="Profile photo" className="personImage" />
      </div>

      <div className="ME-text">
        <h1>About Me</h1>
        <p>Hello! My name is Charlie, and I am an avid enjoyer of dapper ducks.</p>
      </div>
    </section>
  );
}

export default About;
