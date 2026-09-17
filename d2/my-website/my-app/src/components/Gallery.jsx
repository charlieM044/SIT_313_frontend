const photos = [
  { src: '/assets/pexels-1.jpg', alt: 'Gallery image 1 from Pexels' },
  { src: '/assets/pexels-2.jpg', alt: 'Gallery image 2 from Pexels' },
  { src: '/assets/pexels-3.jpg', alt: 'Gallery image 3 from Pexels' },
  { src: '/assets/pixabay-tree.jpg', alt: 'Gallery image 4 from Pixabay' },
  { src: '/assets/pixabay-2.jpg', alt: 'Gallery image 5 from Pixabay' },
];

function Gallery() {
  return (
    <section className="photogallagry" id="gallery">
      <div className="gallery-text">
        <h1>Photo Gallery</h1>
        <p>A few images from Pexels and Pixabay.</p>
      </div>

      <ul className="photo-gallery">
        {photos.map((photo) => (
          <li key={photo.src}>
            <img src={photo.src} alt={photo.alt} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Gallery;
