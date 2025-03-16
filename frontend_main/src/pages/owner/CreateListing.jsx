import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useListing } from '../../context/ListingContext';
import { useLocationContext } from '../../context/LocationContext';
import Spinner from '../../components/common/Spinner';
import LocationSelector from '../../components/listings/LocationSelector';
import DashboardLayout from '../../layouts/DashboardLayout';
import axios from 'axios';

const amenitiesList = [
  'Wi-Fi', 'TV', 'Air Conditioning', 'Washing Machine', 'Refrigerator', 
  'Microwave', 'Gas Connection', 'Parking', 'Power Backup', 'Security', 
  'CCTV', 'Gym', 'Swimming Pool', 'Study Room', 'Housekeeping'
];

const rulesList = [
  'No Smoking', 'No Pets', 'No Parties', 'No Visitors after 10pm',
  'ID Proof Required', 'No Alcohol', 'Vegetarian Only', 'No Non-Veg Cooking'
];

const CreateListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createListing, updateListing, getListingById, loading, error } = useListing();
  const { getAllLocations, getCurrentLocation, showError } = useLocationContext();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'single',
    price: '',
    securityDeposit: '',
    address: '',
    location: '',
    availableFrom: '',
    occupancy: 'single',
    maxOccupancy: 1,
    amenities: [],
    rules: [],
    images: [],
    isActive: true
  });
  
  const [locations, setLocations] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [loadError, setLoadError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [locationData, setLocationData] = useState(null);
  
  // Format date as YYYY-MM-DD for input field
  const formatDateForInput = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };
  
  // Load locations and listing data if in edit mode
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch locations
        const locationsData = await getAllLocations();
        setLocations(locationsData);
        
        // If we have an ID, we're in edit mode
        if (id) {
          setIsEditMode(true);
          const listingData = await getListingById(id);
          
          // Format dates and convert data types
          const formattedListing = {
            ...listingData,
            price: String(listingData.price),
            securityDeposit: String(listingData.securityDeposit),
            availableFrom: formatDateForInput(listingData.availableFrom),
            maxOccupancy: listingData.maxOccupancy || 1,
            location: listingData.location._id
          };
          
          setFormData(formattedListing);
          setImagePreviewUrls(listingData.images || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setLoadError('Failed to load form data. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, getAllLocations, getListingById]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear any error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    if (name === 'amenities' || name === 'rules') {
      // Handle checkboxes for amenities and rules
      const currentArray = [...formData[name]];
      if (checked) {
        currentArray.push(value);
      } else {
        const index = currentArray.indexOf(value);
        if (index > -1) {
          currentArray.splice(index, 1);
        }
      }
      setFormData({
        ...formData,
        [name]: currentArray
      });
    } else if (type === 'checkbox') {
      // For isActive checkbox
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'price' || name === 'securityDeposit' || name === 'maxOccupancy') {
      // Only allow numbers for price, security deposit and max occupancy
      const regex = /^[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleImageChange = (e) => {
    e.preventDefault();
    
    const files = Array.from(e.target.files);
    
    // Add new files to existing ones
    setImageFiles(prevFiles => [...prevFiles, ...files]);
    
    // Create previews for new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prevUrls => [...prevUrls, ...newPreviews]);
  };
  
  const removeImage = (index) => {
    // Remove from preview array
    setImagePreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    
    // If it's a new image (file object exists), remove from files array
    if (imageFiles[index]) {
      setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    } else if (isEditMode) {
      // If it's an existing image URL in edit mode, remove from form data
      const updatedImages = [...formData.images];
      updatedImages.splice(index, 1);
      setFormData({
        ...formData,
        images: updatedImages
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.securityDeposit) errors.securityDeposit = 'Security deposit is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.availableFrom) errors.availableFrom = 'Available date is required';
    
    // Length validations
    if (formData.title.length > 100) errors.title = 'Title cannot exceed 100 characters';
    if (formData.description.length > 2000) errors.description = 'Description cannot exceed 2000 characters';
    
    // Numeric validations
    if (parseInt(formData.price) <= 0) errors.price = 'Price must be greater than 0';
    if (parseInt(formData.securityDeposit) < 0) errors.securityDeposit = 'Security deposit cannot be negative';
    if (parseInt(formData.maxOccupancy) <= 0) errors.maxOccupancy = 'Maximum occupancy must be at least 1';
    
    // Image validation
    if (!isEditMode && imageFiles.length === 0) {
      errors.images = 'At least one image is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure we have location data
    if (!locationData) {
      showError('Please select a location for your listing');
      return;
    }
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare form data
    const processedData = {
      ...formData,
      price: parseInt(formData.price),
      securityDeposit: parseInt(formData.securityDeposit),
      maxOccupancy: parseInt(formData.maxOccupancy),
      location: locationData._id,
      address: locationData.address,
      coordinates: locationData.coordinates,
      availableFrom: new Date(formData.availableFrom).toISOString()
    };
    
    try {
      if (isEditMode) {
        // Update existing listing
        await updateListing(id, processedData, imageFiles, (progress) => {
          setUploadProgress(progress);
        });
        navigate('/dashboard/listings');
      } else {
        // Create new listing
        await createListing(processedData, imageFiles, (progress) => {
          setUploadProgress(progress);
        });
        navigate('/dashboard/listings');
      }
    } catch (err) {
      console.error('Error saving listing:', err);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Spinner size="large" color="indigo" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8 border border-gray-200">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Listing' : 'Create New Listing'}
            </h1>
            <p className="mt-2 text-gray-600">
              Fill in the details below to {isEditMode ? 'update your' : 'create a new'} listing.
            </p>
          </div>

          {loadError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {loadError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                    Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter listing title"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-900">
                    Type*
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="single">Single Room</option>
                    <option value="double">Double Sharing</option>
                    <option value="triple">Triple Sharing</option>
                    <option value="four">Four Sharing</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe your listing"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-900">
                    Area*
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select an area</option>
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.location && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                    Address*
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter complete address"
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing and Availability */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Pricing & Availability</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-900">
                    Monthly Rent (₹)*
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter monthly rent"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-900">
                    Security Deposit (₹)*
                  </label>
                  <input
                    type="number"
                    id="securityDeposit"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter security deposit"
                  />
                  {formErrors.securityDeposit && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.securityDeposit}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-900">
                    Available From*
                  </label>
                  <input
                    type="date"
                    id="availableFrom"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formErrors.availableFrom && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.availableFrom}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      name="amenities"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`amenity-${amenity}`} className="ml-3 text-sm text-gray-900">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">House Rules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {rulesList.map((rule) => (
                  <div key={rule} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`rule-${rule}`}
                      name="rules"
                      value={rule}
                      checked={formData.rules.includes(rule)}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`rule-${rule}`} className="ml-3 text-sm text-gray-900">
                      {rule}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Images</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <label
                    htmlFor="images"
                    className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-indigo-600 hover:text-indigo-500">
                          Upload images
                        </span>
                        {' or drag and drop'}
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  {uploadProgress > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-40 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{uploadProgress}%</span>
                    </div>
                  )}
                </div>

                {formErrors.images && (
                  <p className="text-sm text-red-600">{formErrors.images}</p>
                )}

                {/* Image Preview */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-w-16 aspect-h-9">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-100 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditMode ? 'Update Listing' : 'Create Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing; 