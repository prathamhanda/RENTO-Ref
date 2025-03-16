import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const location = useLocation();
    const navigate = useNavigate();
    const { phone, role } = location.state || {};

    useEffect(() => {
        if (!phone || !role) {
            navigate('/login');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phone, role, navigate]);

    const handleResendOTP = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: phone, role }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('OTP resent successfully!');
                setTimeLeft(300); // Reset timer
            } else {
                toast.error(data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: phone, otp, role }),
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Login successful!');
                navigate('/');
            } else {
                toast.error(data.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to verify OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Verify WhatsApp OTP
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter the OTP sent to your WhatsApp number
                    <br />
                    <span className="font-medium text-[#FE6F61]">{phone}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                OTP
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FE6F61] focus:border-[#FE6F61] sm:text-sm"
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    pattern="\d{6}"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FE6F61] hover:bg-[#e5635b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FE6F61]"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Time remaining: {formatTime(timeLeft)}
                            </p>
                            {timeLeft === 0 && (
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="mt-2 text-[#FE6F61] hover:text-[#e5635b] text-sm font-medium"
                                    disabled={isLoading}
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP; 