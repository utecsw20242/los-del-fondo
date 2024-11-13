import React, {useState} from 'react';

const SearchBar = ({ searchTerm, onSearch, onSort }) => {
    const [showSortOptions, setShowSortOptions] = useState(false);
    const handleToggleSortOptions = () => {
        setShowSortOptions(!showSortOptions);
    };
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search folders..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
      <button onClick={handleToggleSortOptions}>Order By</button>
        {showSortOptions && (
          <div className="sort-options">
            <button onClick={() => onSort('name')}>Name</button>
            <button onClick={() => onSort('date')}>Date</button>
          </div>
        )}
    </div>
  );
};

export default SearchBar;