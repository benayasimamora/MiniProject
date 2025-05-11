'use client'
import { IoPersonCircleOutline } from "react-icons/io5";
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Removed incorrect import

export default function LandingPage() {
    const router = useRouter();

    const slides = [
        {
            id: 1,
            image: "./item/poster2.png",
            alt: "Festival crowd enjoying music",
            title: "SUMMER VIBES",
            subtitle: "MUSIC FESTIVAL",
            buttonText: "temukan jazz mu sekarang!"
        },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const handleSearch = () => console.log('Searching for:', searchQuery);
    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter') handleSearch();
    };

    const [currentSlide, setCurrentSlide] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    const goToSlide = (index: number) => setCurrentSlide(index);


    return (
        <div className="montserrat-project">
            {/* Header */}
            <div className="p-2 bg-white flex items-center justify-between w-full fixed z-30">
                <div>
                    <img className="w-30 h-auto" src="./logo/logotiket.png" alt="Logo" />
                </div>

                <div className="w-full max-w-xl mx-8">
                    <div className="relative flex items-center">
                        <div className="absolute left-4 text-gray-500">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="search events here"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full py-2 pl-12 pr-4 bg-white rounded-full border border-[#b8b8b8] focus:border-[#4190FF] focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-200"
                        />
                    </div>
                </div>

                {/* Tombol Sign In yang mengarahkan ke /login */}
                <div className="flex items-center space-x-7 font-medium pr-10">
                    <button
                        onClick={() => router.push('login')} // Fixed navigation issue
                        className="flex items-center space-x-2 bg-[#f9f9f9] border-1 text-[#3273CD] border-[#3273CD] rounded-md py-1 px-2"
                    >
                        <h3>sign in</h3>
                        <IoPersonCircleOutline size={25} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-16">
                <div className="pb-200">
                    <div className="relative w-full h-96 overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-in-out h-full"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {slides.map((slide) => (
                                <div key={slide.id} className="min-w-full h-full relative">
                                    <img
                                        src={slide.image}
                                        alt={slide.alt}
                                        loading="lazy"
                                        className="w-full h-full object-cover image-render-pixel"
                                    />
                                    <div className="absolute inset-0 flex flex-col justify-center items-center">
                                        <div className="absolute bottom-6 left-1/6 transform -translate-x-1/2 z-10">
                                            <button className="bg-white text-[#3273CD] font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300">
                                                {slide.buttonText}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100"
                            aria-label="Previous slide"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100"
                            aria-label="Next slide"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-gray-400'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}