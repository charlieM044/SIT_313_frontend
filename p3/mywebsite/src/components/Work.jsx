const projects = [
  {
    id: 1,
    title: 'Project 1 GIT link',
    link: 'https://github.com/charlieM044/SIT210/tree/main/robo%20code%20final',
    videoSrc: 'https://www.youtube-nocookie.com/embed/fE-T46U4Aq8?rel=0&widget_referrer=https%3A%2F%2Fwww.youtube.com',
  },
  {
    id: 2,
    title: 'Project 2 GIT link',
    link: 'https://github.com/charlieM044/SIT210/tree/main/robo%20code%20final',
    videoSrc: 'https://www.youtube-nocookie.com/embed/fE-T46U4Aq8?rel=0&widget_referrer=https%3A%2F%2Fwww.youtube.com',
  },
  {
    id: 3,
    title: 'Project 3 GIT link',
    link: 'https://github.com/charlieM044/SIT210/tree/main/robo%20code%20final',
    videoSrc: 'https://www.youtube-nocookie.com/embed/fE-T46U4Aq8?rel=0&widget_referrer=https%3A%2F%2Fwww.youtube.com',
  },
];

function Work() {
  return (
    <section className="work" id="work">
      <div className="work-text">
        <h1>My Work</h1>
        <p>Projects</p>
      </div>

      <ul className="projects">
        {projects.map((project) => (
          <li key={project.id}>
            <article className="project">
              <a href={project.link}>{project.title}</a>
              <div className="project-video" aria-label={`${project.title} video preview`}>
                <iframe
                  src={project.videoSrc}
                  title={`${project.title} video preview`}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Work;
