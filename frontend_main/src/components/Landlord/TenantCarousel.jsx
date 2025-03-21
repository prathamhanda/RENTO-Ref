import React from 'react';
import { Card } from "@heroui/react";
import { motion } from "framer-motion";

const TenantCarousel = () => {
  // Mock data for tenants
  const tenants = [
    {
      id: 1,
      name: "John Doe",
      room: "Room 101",
      status: "Current",
      rentDue: "₹7,000",
      moveOutDate: "30 May 2024",
      image: "/images/tenant1.jpg"
    },
    {
      id: 2,
      name: "Jane Smith",
      room: "Room 102",
      status: "Vacating",
      rentDue: "₹8,000",
      moveOutDate: "15 Apr 2024",
      image: "/images/tenant2.jpg"
    },
    {
      id: 3,
      name: "Michael Johnson",
      room: "Room 201",
      status: "Current",
      rentDue: "₹9,500",
      moveOutDate: "10 Jun 2024",
      image: "/images/tenant1.jpg"
    },
    {
      id: 4,
      name: "Sarah Williams",
      room: "Room 305",
      status: "Vacating",
      rentDue: "₹6,500",
      moveOutDate: "22 Apr 2024",
      image: "/images/tenant2.jpg"
    },
    {
      id: 5,
      name: "Raj Patel",
      room: "Room 110",
      status: "Current",
      rentDue: "₹8,200",
      moveOutDate: "15 Jul 2024",
      image: "/images/tenant1.jpg"
    },
    {
      id: 6,
      name: "Priya Sharma",
      room: "Room 203",
      status: "Current",
      rentDue: "₹7,800",
      moveOutDate: "05 Aug 2024",
      image: "/images/tenant2.jpg"
    },
    {
      id: 7,
      name: "David Wilson",
      room: "Room 402",
      status: "Vacating",
      rentDue: "₹10,000",
      moveOutDate: "28 Apr 2024",
      image: "/images/tenant1.jpg"
    }
  ];

  return (
    <div className="flex items-center relative group">
      <motion.button 
        className="absolute z-10 left-0 bg-white text-gray-700 w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:bg-gray-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ‹
      </motion.button>
      
      <div className="flex overflow-x-scroll scroll-smooth gap-6 p-4 w-full scrollbar-hide 
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="min-w-[300px] p-4 bg-white rounded-xl shadow-sm">
            <div className="flex gap-4">
              <img 
                src={tenant.image} 
                alt={tenant.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <h3 className="font-semibold text-lg">{tenant.name}</h3>
                <p className="text-sm text-gray-500">{tenant.room}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tenant.status === "Current" 
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}>
                    {tenant.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Rent Due</p>
                <p className="font-semibold">{tenant.rentDue}</p>
              </div>
              <div>
                <p className="text-gray-500">Move Out</p>
                <p className="font-semibold">{tenant.moveOutDate}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <motion.button 
        className="absolute z-10 right-0 bg-white text-gray-700 w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:bg-gray-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ›
      </motion.button>
    </div>
  );
};

export default TenantCarousel;
