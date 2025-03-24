
import React, { useState } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from "../ui/carousel";
import { Card } from "../ui/card";
import { CircleDot, PackageCheck, Sparkles, BrainCircuit, Truck, TrendingUp, Package, Globe, Search } from "lucide-react";

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const keyframesStyle = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

const slides = [
  {
    title: "TrackScore Separates Profitable Orders from Risky Ones",
    description: "We help you identify which orders bring profit and which ones bring loss.",
    icon: <TrendingUp className="h-10 w-10 text-green-500" />,
    content: (
      <div className="p-4">
        <div className="w-full h-16 bg-gray-200 rounded-lg overflow-hidden mb-3 flex">
          <div className="h-full bg-green-500 relative" style={{ width: '75%' }}>
            <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm md:text-base">
              +₹35,000 Profit
            </span>
          </div>
          
          <div className="h-full bg-red-500 relative" style={{ width: '25%' }}>
            <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm md:text-base">
              -₹12,000 Loss
            </span>
          </div>
        </div>
        
        <div className="mt-6 mb-2 text-center">
          <span className="text-slate-700 font-medium">After TrackScore</span>
        </div>
        
        <div className="w-full h-16 bg-gray-200 rounded-lg overflow-hidden mb-3 flex">
          <div className="h-full bg-green-500 relative" style={{ width: '75%' }}>
            <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm md:text-base">
              +₹35,000 Profit
            </span>
          </div>
          
          <div className="h-full bg-gray-200 relative" style={{ width: '25%' }}>
            <span className="absolute inset-0 flex items-center justify-center text-slate-500 font-semibold text-xs md:text-sm">
              <span className="flex flex-col items-center">
                <Truck className="h-4 w-4 mb-1" />
                WhatsApp Notified
              </span>
            </span>
          </div>
        </div>
        <p className="text-center text-slate-600 mt-2">
          TrackScore separates profitable orders from risky ones
        </p>
      </div>
    )
  },
  {
    title: "Our AI is Our USP",
    description: "We don't just identify risks - we tell you exactly what to do.",
    icon: <BrainCircuit className="h-10 w-10 text-purple-500" />,
    content: (
      <div className="p-4">
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-slate-800 mb-2">Other RTO Tools</h4>
          <div className="flex justify-between mb-2">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm">High</div>
            <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-sm">Medium</div>
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm">Low</div>
          </div>
          <p className="text-sm text-slate-600">Just provide risk labels without actionable guidance</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">TrackScore AI</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Tells you exactly which orders to fulfill</span>
            </li>
            <li className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Maintains accountability with detailed tracking</span>
            </li>
            <li className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Provides metrics on capital performance</span>
            </li>
            <li className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Delivers instant boost in net profits</span>
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Our AI Goes Beyond Ordinary Tools",
    description: "Personalized AI that learns and adapts to your specific business.",
    icon: <Sparkles className="h-10 w-10 text-indigo-500" />,
    content: (
      <div className="p-4">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
            <BrainCircuit className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-indigo-50 p-3 rounded-lg text-center">
            <p className="text-indigo-700 font-medium text-sm">Product Performance</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg text-center">
            <p className="text-indigo-700 font-medium text-sm">City-wise Analysis</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg text-center">
            <p className="text-indigo-700 font-medium text-sm">Pincode Metrics</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg text-center">
            <p className="text-indigo-700 font-medium text-sm">Business Type</p>
          </div>
        </div>
        
        <p className="text-center text-slate-700">
          Our AI learns and adapts to your specific business patterns, providing personalized insights that drive better decisions.
        </p>
      </div>
    )
  }
];

const HowItWorksSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  React.useEffect(() => {
    if (carouselApi) {
      carouselApi.scrollTo(activeSlide);
    }
  }, [carouselApi, activeSlide]);
  
  React.useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);
    
    // Cleanup
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);
  
  // Add the fixed chart data generation starting from 0,0
  const generateLeftPeakData = () => {
    const totalOrders = 156;
    const peak = 40; // Peak shifted left
    return Array.from({ length: Math.ceil(totalOrders / 5) + 1 }, (_, i) => {
      const orders = i * 5;
      const standardDeviation = 50;
      const amplitude = 100;
      const profit = orders === 0 ? 0 : Math.round(amplitude * Math.exp(-Math.pow(orders - peak, 2) / (2 * Math.pow(standardDeviation, 2))));
      return { orders, profit };
    });
  };

  const generateRightPeakData = () => {
    const totalOrders = 156;
    const peak = 120; // Peak shifted right
    return Array.from({ length: Math.ceil(totalOrders / 5) + 1 }, (_, i) => {
      const orders = i * 5;
      const standardDeviation = 50;
      const amplitude = 100;
      const profit = orders === 0 ? 0 : Math.round(amplitude * Math.exp(-Math.pow(orders - peak, 2) / (2 * Math.pow(standardDeviation, 2))));
      return { orders, profit };
    });
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
      <h3 className="text-xl font-semibold mb-4">How TrackScore Works</h3>
      
      <Carousel 
        className="w-full max-w-3xl mx-auto"
        setApi={setCarouselApi}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="border-0 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-slate-50 rounded-full">
                        {slide.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">{slide.title}</h4>
                        <p className="text-sm text-slate-600">{slide.description}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      {slide.content}
                    </div>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-center mt-6">
          <CarouselPrevious className="relative static left-0 right-0 translate-y-0 mr-2" />
          <div className="flex gap-1">
            {slides.map((_, index) => (
              <CircleDot 
                key={index} 
                className={`h-3 w-3 cursor-pointer ${activeSlide === index ? 'text-blue-500' : 'text-slate-300'}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
          <CarouselNext className="relative static left-0 right-0 translate-y-0 ml-2" />
        </div>
      </Carousel>
    </div>
  );
};

export default HowItWorksSlider;
