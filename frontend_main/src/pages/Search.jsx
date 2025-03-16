import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListing } from '../context/ListingContext';
import { useLocationContext } from '../context/LocationContext';
import MainLayout from '../layouts/MainLayout';
import ListingCard from '../components/listings/ListingCard';
import SearchBar from '../components/search/SearchBar';
import Spinner from '../components/common/Spinner';
import Map from '../components/common/Map';

const Search = () => {
  const [searchParams] = useSearchParams();
  const { searchListings, loading, error } = useListing();
  const { locations, fetchLocations } = useLocationContext();
  
  // Get query parameters from URL
  const initialQuery = searchParams.get('query') || '';
  const initialLocation = searchParams.get('location') || '';
  
  // State for listings and filters
  const [listings, setListings] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    amenities: [],
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Available amenities for filter
  const availableAmenities = [
    'Wi-Fi', 'AC', 'TV', 'Fridge', 'Washing Machine', 
    'Geyser', 'Power Backup', 'Parking', 'Food', 'Security'
  ];
  
  // Available types for filter
  const types = ['Single Room', 'Double Sharing', 'Triple Sharing', 'Four Sharing'];
  
  useEffect(() => {
    fetchLocations();
    performSearch();
  }, [initialQuery, initialLocation]);
  
  const performSearch = async () => {
    try {
      const result = await searchListings({
        query: initialQuery,
        location: initialLocation,
        type: filters.type,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        amenities: filters.amenities,
        sortBy: filters.sortBy,
        page
      });
      
      // Ensure result.listings is an array
      setListings(Array.isArray(result.listings) ? result.listings : []);
      setTotalListings(result.total || 0);
    } catch (err) {
      console.error('Search error:', err);
      setListings([]); // Reset listings on error
    }
  };
  
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleAmenityToggle = (amenity) => {
    const updatedAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    setFilters({
      ...filters,
      amenities: updatedAmenities
    });
  };
  
  const applyFilters = () => {
    setPage(1);
    performSearch();
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };
  
  const resetFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      amenities: [],
      sortBy: 'newest'
    });
    setPage(1);
    performSearch();
  };

  // Create markers array from listings
  const markers = listings.map(listing => ({
    coordinates: {
      lat: listing.location.coordinates?.lat || 0,
      lng: listing.location.coordinates?.lng || 0
    },
    title: listing.title,
    address: `${listing.address}, ${listing.location.name}`
  }));

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-white text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition shadow-sm border border-gray-200"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        <div className="flex flex-wrap gap-6">
          {/* Filters column */}
          <div className="w-full lg:w-1/4">
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar initialQuery={initialQuery} initialLocation={initialLocation} />
            </div>
            
            {/* Filters Section - Mobile Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
            
            {/* Filters Section */}
            <div className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Filters</h3>
                
                {/* Type Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    PG Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">All Types</option>
                    {types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Price Range Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                {/* Amenities Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Amenities
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {availableAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <input
                          id={`amenity-${amenity}`}
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`amenity-${amenity}`} className="ml-3 block text-sm text-gray-900">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Sort By Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
                
                {/* Filter Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                  >
                    Apply
                  </button>
                  <button
                    onClick={resetFilters}
                    className="flex-1 border border-gray-300 text-gray-900 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="large" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                {/* Map View */}
                {showMap && (
                  <div className="mb-6 h-[400px] rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <Map markers={markers} />
                  </div>
                )}

                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-gray-900">
                    Found <span className="font-semibold">{totalListings}</span> listings
                  </p>
                </div>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>

                {/* No Results */}
                {listings.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-900 text-lg">No listings found matching your criteria.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Search; 