import { useState } from 'react';
import { createPortal } from 'react-dom';

function SearchBar({ onSearch, onPostClick }) {


  const [searchTerm, setSearchTerm] = useState('');
  const [showLogin, setShowLogin] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="search-bar-header">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
        <button type="submit">Search</button>
      </form>

    
    </div>
  );


}

export default SearchBar;