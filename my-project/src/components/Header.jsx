import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        ChatApp
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200">Home</Link>
                    <Link to="/about" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200">About</Link>
                    <Link to="/contact" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200">Contact</Link>
                </div>

                {/* Auth Buttons / Profile */}
                <div className="flex items-center space-x-4">
                    {localStorage.getItem('access_token') ? (
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-105 transition-transform">
                                <span className="text-white font-black text-xs">U</span>
                            </div>
                            <span className="text-gray-700 font-bold text-sm hidden sm:block">My Account</span>
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200 hidden sm:block">
                                Log in
                            </Link>
                            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;