import React, { useState, useEffect } from 'react';
import axios from 'axios';
import"./Searchar.css"

interface Item {
  id: number;
  name: string;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState<string>(''); 
  const [items, setItems] = useState<Item[]>([]); 
  const [filteredItems, setFilteredItems] = useState<Item[]>([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        setItems(response.data); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  
  useEffect(() => {
    if (query) {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    } 
  }, [query, items]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); 
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={handleSearch}
        className="search-input"
      />
      {filteredItems.length > 0 ? (
        <ul className="search-results">
          {filteredItems.map((item) => (
            <li key={item.id} className="search-item">
              {item.name}
            </li>
          ))}
        </ul>
      ) : (
        <p ></p>
      )}
    </div>
  );
};

export default SearchBar;
