import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function MobileNav({ tableId, cartCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMenuPage = location.pathname.includes("/menu");
  const isCartPage = location.pathname.includes("/cart");

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => navigate(`/table/${tableId}/menu`)}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-colors ${
            isMenuPage
              ? "bg-orange-50 text-orange-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-xs font-semibold">Menu</span>
        </button>
        <button
          onClick={() => navigate(`/table/${tableId}/cart`)}
          className={`flex-1 flex flex-col items-center justify-center h-full relative transition-colors ${
            isCartPage
              ? "bg-orange-50 text-orange-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {cartCount > 0 && (
            <span className="absolute top-2 right-1/2 transform translate-x-6 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-xs font-semibold">Cart</span>
        </button>
      </div>
    </div>
  );
}

export default MobileNav;
