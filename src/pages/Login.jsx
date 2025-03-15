import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('student');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setIsLoading(true);
        try {
            // Format phone number - ensure it has country code
            const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
            
            console.log('Sending request with:', { 
                phoneNumber: formattedPhone, 
                role 
            });

            const response = await fetch('http://localhost:5000/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    phoneNumber: formattedPhone,
                    role 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Server error');
            }

            const data = await response.json();
            
            if (data.success) {
                toast.success('OTP sent successfully!');
                navigate('/verify-otp', { 
                    state: { 
                        phone: formattedPhone,
                        role 
                    } 
                });
            } else {
                toast.error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error details:', error);
            toast.error(error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Login with WhatsApp
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    You'll receive an OTP on your WhatsApp
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <div className="mt-1 text-black">
                                <PhoneInput
                                    country={'in'}
                                    value={phone}
                                    onChange={setPhone}
                                    inputStyle={{
                                        width: '100%',
                                        height: '42px',
                                    }}
                                    inputProps={{
                                        required: true,
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                I am a
                            </label>
                            <div className="mt-2 flex space-x-4">
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-md ${
                                        role === 'student'
                                            ? 'bg-[#FE6F61] text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick={() => setRole('student')}
                                >
                                    Student
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-md ${
                                        role === 'landlord'
                                            ? 'bg-[#FE6F61] text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick={() => setRole('landlord')}
                                >
                                    Landlord
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FE6F61] hover:bg-[#e5635b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FE6F61]"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 