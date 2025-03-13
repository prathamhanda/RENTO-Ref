import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useListing } from '../context/ListingContext';
import { useLocation as useLocationContext } from '../context/LocationContext';
import Spinner from '../components/common/Spinner';
import MainLayout from '../layouts/MainLayout';
import ListingCard from '../components/listings/ListingCard';
import Carousel from '../components/Carousel';
import FeatureCard from '../components/FeatureCard';
import GallerySection from '../components/GallerySection';

// Sample data for colleges
const colleges = [
  "Zakir Husain College Delhi",
  "Jesus and Mary College",
  "Sri Guru Gobind Singh College of Commerce",
  "Shri Ram College of Commerce",
  "Sri Venkateswara College",
  "Lady Shri Ram College for Women",
  "Hindu College",
  "Hansraj College",
  "Gargi College",
  "Daulat Ram College",
  // Add more colleges as needed
];

// Sample data for areas
const areas = {
  "South Delhi": [
    "Malviya Nagar", "Saket", "Hauz Khas", "Kalkaji", "Greater Kailash",
    "Lajpat Nagar", "Green Park", "Vasant Kunj", "Sheikh Sarai", "Satya Niketan",
  ],
  "North Delhi": [
    "Mukherjee Nagar", "Kamla Nagar", "Hudson Lane", "Model Town", "GTB Road",
    "Old Rajinder Nagar", "Shakti Nagar", "Vijay Nagar", "Patel Nagar", "Karol Bagh",
  ],
  "East Delhi": [
    "Laxmi Nagar", "Mayur Vihar (Phase I)", "Mayur Vihar (Phase II)", "Mayur Vihar (Phase III)",
    "Preet Vihar", "Karkardooma", "Vasundhara Nagar", "IP Extension", "Shakarpur",
  ],
  "West Delhi": [
    "Janakpuri", "Uttam Nagar", "Rajouri Garden", "Vikaspuri", "Subhash Nagar",
    "Tilak Nagar", "Paschim Vihar", "Dwarka Mor", "Naraina Vihar", "Tagore Garden",
  ]
};

const Home = () => {
  const { getListings, listings, loading } = useListing();
  const { getLocations } = useLocationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredColleges, setFilteredColleges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getListings();
    getLocations();
  }, [getListings, getLocations]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value) {
      const filtered = colleges.filter(college =>
        college.toLowerCase().includes(value.toLowerCase())
      );

      // Sort suggestions: first by those starting with the input, then by those containing it
      const sortedFiltered = filtered.sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(value.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(value.toLowerCase());

        if (aStartsWith && !bStartsWith) return -1; // a comes first
        if (!aStartsWith && bStartsWith) return 1;  // b comes first
        return a.localeCompare(b); // alphabetical order
      });

      setFilteredColleges(sortedFiltered);
    } else {
      setFilteredColleges([]);
    }
  };

  const handleSuggestionClick = (college) => {
    setSearchTerm(college);
    setFilteredColleges([]);
  };

  const highlightMatch = (text) => {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
      <span key={index} style={{ color: 'black' }}>{part}</span> : 
      <span key={index} style={{ color: 'black' }}>{part}</span>
    );
  };

  // Carousel items
  const carouselItems = [
    {
      title: "Luxury PG Accommodation",
      description: "Premium living spaces with modern amenities"
    },
    {
      title: "Budget-Friendly Options",
      description: "Affordable PGs for students and working professionals"
    },
    {
      title: "Near Campus Living",
      description: "PGs within walking distance from colleges"
    },
    {
      title: "Fully Furnished Rooms",
      description: "Move in with just your personal belongings"
    },
    {
      title: "Safe & Secure Environment",
      description: "24/7 security and CCTV surveillance"
    }
  ];

  // Bottom carousel items
  const bottomCarouselItems = [
    {
      title: "Featured PG 1",
      description: "Luxury PG accommodation near campus"
    },
    {
      title: "Featured PG 2",
      description: "Budget-friendly student housing"
    },
    {
      title: "Featured PG 3",
      description: "Premium student apartments"
    }
  ];

  // Gallery items
  const galleryItemsNorth = [
    { image: 'https://images.trvl-media.com/lodging/23000000/22410000/22408200/22408101/b1d9ae65.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill', title: 'Kamal Nagar' },
    { image: 'https://img.staticmb.com/mbphoto/locality/cropped_images/2022/Jan/22/Photo_h470_w1080/80367_Triente-Suites1_470_1080.jpg', title: 'Kalyan Vihar' },
    { image: 'https://img.staticmb.com/mbphoto/locality/cropped_images/2024/Jul/23/Photo_h470_w1080/53480_20230605_131543---arun-shrivastav_470_1080.jpg', title: 'Roop Nagar' },
    { image: 'https://static.toiimg.com/thumb/msid-92217326,width-1280,height-720,resizemode-72/92217326.jpg', title: 'Ghanta Ghar' },
    { image: 'https://static.squareyards.com/reviewrating/images/1718265003675.jpeg?aio=w-568;h-377;crop;', title: 'Shakti Nagar' },
  ];

  const galleryItemsSouth = [
    { image: 'https://images.trvl-media.com/lodging/23000000/22410000/22408200/22408101/b1d9ae65.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill', title: 'Malviya Nagar' },
    { image: 'https://img.staticmb.com/mbphoto/locality/cropped_images/2022/Jan/22/Photo_h470_w1080/80367_Triente-Suites1_470_1080.jpg', title: 'Saket' },
    { image: 'https://img.staticmb.com/mbphoto/locality/cropped_images/2024/Jul/23/Photo_h470_w1080/53480_20230605_131543---arun-shrivastav_470_1080.jpg', title: 'Hauz Khas' },
    { image: 'https://static.toiimg.com/thumb/msid-92217326,width-1280,height-720,resizemode-72/92217326.jpg', title: 'Lajpat Nagar' },
    { image: 'https://static.squareyards.com/reviewrating/images/1718265003675.jpeg?aio=w-568;h-377;crop;', title: 'Green Park' },
  ];

  const galleryItemsOff = [
    { image: 'https://images.trvl-media.com/lodging/23000000/22410000/22408200/22408101/b1d9ae65.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill', title: 'Dwarka' },
    { image: 'https://img.staticmb.com/mbphoto/locality/cropped_images/2022/Jan/22/Photo_h470_w1080/80367_Triente-Suites1_470_1080.jpg', title: 'Noida' },
    { image: 'https://img.staticmb.com/mbphoto/locality/cropped_images/2024/Jul/23/Photo_h470_w1080/53480_20230605_131543---arun-shrivastav_470_1080.jpg', title: 'Gurgaon' },
    { image: 'https://static.toiimg.com/thumb/msid-92217326,width-1280,height-720,resizemode-72/92217326.jpg', title: 'Faridabad' },
    { image: 'https://static.squareyards.com/reviewrating/images/1718265003675.jpeg?aio=w-568;h-377;crop;', title: 'Ghaziabad' },
  ];

  // Feature cards data
  const featureData = [
    {
      image: "https://amity.edu/images/university.jpg",
      title: "Verified Listings",
      description: "All PGs are personally verified"
    },
    {
      image: "https://amity.edu/images/university.jpg",
      title: "No Brokerage",
      description: "Book directly with owners"
    },
    {
      image: "https://amity.edu/images/university.jpg",
      title: "Near Colleges",
      description: "Walking distance from campus"
    }
  ];

  return (
    <MainLayout>
      <div className="relative">
        <img 
          src="https://amity.edu/images/university.jpg" 
          alt="homebg" 
          className='w-full h-[650px] object-cover'
        />   
        <div className="absolute inset-0 bg-black/65"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full font-montserrat">
          <h1 className="text-white text-3xl md:text-5xl font-bold mb-4">
            Student Centric Accommodation Platform
          </h1>
          <p className="text-white text-lg md:text-2xl">
            affordable & comfortable living, just steps away from campus!
          </p>
          <div className="relative w-3/4 mx-auto mt-8">
            <input 
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search for your desired college, location or PG"
              className="w-full px-6 py-4 bg-white rounded-full text-gray-800 focus:outline-none font-montserrat"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#FE6F61] hover:bg-[#e3837a] p-3 rounded-full cursor-pointer">
              <svg 
                className="w-6 h-6 text-white"
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            {filteredColleges.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-[#FE6F61] rounded-lg shadow-lg mt-1 suggestion-box">
                <div className="max-h-40 overflow-y-auto">
                  {filteredColleges.map((college, index) => (
                    <div 
                      key={index} 
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleSuggestionClick(college)}
                    >
                      {highlightMatch(college)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* overlapping feature cards */}
        <div className="absolute bottom-0 w-full px-5 md:px-20 translate-y-1/2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featureData.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Add margin bottom to account for overlapping cards */}
      <div className="mb-20"></div>
      
      <h1 className='text-black px-5 md:px-20 py-5 text-3xl md:text-4xl font-montserrat font-bold tracking-wide'>Your <span className='text-[#FE6F61]'>Perfect</span> Accommodation</h1>
      <Carousel items={carouselItems} />
      
      {/* Premium Accommodation Section */}
      <div className="mx-5 md:mx-20 my-7 rounded-xl border-2 border-[#AE8549] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#AE8549]/20 to-white/0 pointer-events-none" />
        <div className="p-4 pl-2">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold mb-6 text-[#AE8549] tracking-wide flex items-center gap-2 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="#AE8549" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            Premium Accommodation Show-Off
          </h2>
          <Carousel items={bottomCarouselItems} />
        </div>
      </div>

      <h1 className='text-black px-5 md:px-20 py-5 text-3xl md:text-4xl font-montserrat font-bold tracking-wide'><span className='text-[#FE6F61]'>Short</span> Stays</h1>
      <Carousel items={bottomCarouselItems}/>
      
      <h1 className='text-black px-5 md:px-20 py-5 text-3xl md:text-4xl font-montserrat font-bold tracking-wide'>Flatmate <span className='text-[#FE6F61]'>Needed</span></h1>
      <Carousel items={bottomCarouselItems}/>

      {/* Our Services Section */}
      <h1 className='text-black px-5 md:px-20 py-5 text-3xl md:text-4xl font-montserrat font-bold tracking-wide'>Our <span className='text-[#FE6F61]'>Services</span></h1>
      <div className="bg-gray-50 py-8 shadow-sm">
        <div className="flex flex-wrap justify-around gap-4 px-5 md:px-20">
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-300 text-center w-full sm:w-1/5">
            <div className="bg-[#FE6F61] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black mb-1">One Click Booking</h3>
            <p className="text-sm text-gray-600">Book your perfect student accommodation instantly</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-300 text-center w-full sm:w-1/5">
            <div className="bg-[#FE6F61] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black mb-1">Lowest Price Guaranteed</h3>
            <p className="text-sm text-gray-600">Find a lower price and we will match it. No questions asked</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl border border-gray-300 p-6 text-center w-full sm:w-1/5">
            <div className="bg-[#FE6F61] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black mb-1">24/7 Customer Support</h3>
            <p className="text-sm text-gray-600">Each and every query will be answered instantly</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl border border-gray-300 p-6 text-center w-full sm:w-1/5">
            <div className="bg-[#FE6F61] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black mb-1">100% Verified Properties</h3>
            <p className="text-sm text-gray-600">We only list the properties after proper research</p>
          </div>
        </div>
      </div>

      <h1 className='text-black px-5 md:px-20 py-2 text-3xl md:text-4xl font-montserrat font-bold tracking-wide'>Popular areas for<span className='text-[#FE6F61]'> students </span>in Delhi</h1>
      <h1 className='text-[#979797] px-5 md:px-20 text-[16px] tracking-wide font-semibold font-montserrat'>Book student accommodations near universities around Delhi</h1>

      {/* Gallery Sections */}
      <GallerySection title="North Campus" items={galleryItemsNorth} />
      <GallerySection title="South Campus" items={galleryItemsSouth} />
      <GallerySection title="Off Campus" items={galleryItemsOff} />

      <h1 className='text-black px-5 md:px-20 py-2 text-3xl md:text-4xl font-montserrat font-bold tracking-wide'>Book your favourite room in <span className='text-[#FE6F61]'>3 simple steps</span></h1>
      <h1 className='text-[#979797] px-5 md:px-20 text-[16px] tracking-wide font-semibold font-montserrat'>What do our 10k+ Students have to say about their experience with ROR</h1>

      {/* Steps Section */}
      <div className="py-6">
        <div className="flex flex-col md:flex-row gap-8 px-5 md:px-20 mb-4 justify-between items-center">
          <div className="flex flex-col items-center text-center p-6 w-full md:w-1/3 h-[142px] rounded-xl shadow-md border border-gray-300">
            <h2 className="text-xl font-bold text-black">Discover & Choose</h2>
            <p className="text-gray-600 text-sm mt-2">Choose and pick from a plethora of verified student Flats & PGs</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 w-full md:w-1/3 h-[142px] rounded-xl shadow-md border border-gray-300">
            <h2 className="text-xl font-bold text-black">Fill in your details</h2>
            <p className="text-gray-600 text-sm mt-2">Fill in all your necessary personal details required for the booking.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 w-full md:w-1/3 h-[142px] rounded-xl shadow-md border border-gray-300">
            <h2 className="text-xl font-bold text-black">Accommodation Secured!</h2>
            <p className="text-gray-600 text-sm mt-2">Take it easy, pack up, and embark on a new chapter of life!</p>
          </div>
        </div>
      </div>

      {/* Need Assistance Section */}
      <div className="text-center bg-gray-100 flex flex-wrap items-center font-montserrat py-10">
        <div className='text-black flex flex-col p-5 px-5 md:px-20 w-full md:w-1/2 text-left'>
          <h2 className='font-bold text-[36px]'>Need Assistance?</h2>
          <p className='text-[16px] text-[#656565]'>Feel free to reach out with any questions.</p>
        </div>
        
        <div className='icons flex flex-wrap gap-4 justify-center items-center font-extrabold w-full md:w-1/2 px-5'>
          <a href="https://wa.me/916207409628" className='h-[125px] w-full max-w-[220px] bg-transparent border-2 border-gray-600 rounded-lg flex flex-col justify-center items-center text-center transition-transform transform hover:scale-105 hover:bg-gray-200'>
            <img src="https://img.icons8.com/?size=100&id=16713&format=png&color=000000" alt="whatsapp logo" className='h-[38px]' />
            <h1 className='text-[16px] font-montserrat text-black'>WhatsApp Chat</h1>
          </a>
          <a href="tel:+916207409628" className='icons h-[125px] w-full max-w-[220px] bg-transparent border-2 border-gray-600 rounded-lg flex flex-col justify-center items-center text-center transition-transform transform hover:scale-105 hover:bg-gray-200'>
            <img src="https://img.icons8.com/?size=100&id=47813&format=png&color=000000" alt="call logo" className='h-[38px]' />
            <h1 className='text-[16px] font-montserrat text-black'>+91 62074 09628</h1>
          </a>
          <a href="mailto:example@example.com" className='icons h-[125px] w-full max-w-[220px] bg-transparent border-2 border-gray-600 rounded-lg flex flex-col justify-center items-center text-center transition-transform transform hover:scale-105 hover:bg-gray-200'>
            <img src="https://img.icons8.com/?size=100&id=mtfWz20b5AxB&format=png&color=000000" alt="email logo" className='h-[40px]' />
            <h1 className='text-[16px] font-montserrat text-black'>Email us</h1>
          </a>
        </div>
      </div>

      {/* Where we operate Section */}
      <h1 className='text-black px-5 md:px-20 mt-2 text-3xl md:text-4xl font-montserrat font-bold tracking-wide'>Where we <span className='text-[#FE6F61]'>operate</span></h1>
      <h1 className='text-[#979797] px-5 mb-4 mt-2 md:px-20 text-[16px] tracking-wide font-semibold font-montserrat'>Trusted student lodging near key universities and bustling zones in Delhi.</h1>

      <div className="grid px-5 md:px-20 grid-cols-1 md:grid-cols-4 gap-4 mb-10 text-gray-600">
        {Object.entries(areas).map(([region, locations]) => (
          <div key={region}>
            <h3 className="font-bold text-[#FE6F61] mt-4 mb-4 text-[18px]">{region}</h3>
            <ul>
              {locations.map(location => (
                <li key={location} className="mb-2 text-[16px]">{location}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Featured Listings Section */}
      {!loading && listings.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured PG Accommodations</h2>
            <Link to="/search" className="text-[#FE6F61] hover:underline font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.slice(0, 6).map((listing) => (
              <div key={listing._id}>
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Home;