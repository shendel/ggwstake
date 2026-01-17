// Pagination.tsx
import React, { useEffect } from 'react';

interface UserDepositsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const UserDepositsPagination: React.FC<UserDepositsPaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  containerRef 
}) => {
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Прокрутка к началу списка при смене страницы
  useEffect(() => {
    const smoothScroll = () => {
      if (containerRef?.current) {
        // Используем scrollIntoView с плавной анимацией
        containerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      } else {
        // Если нет ссылки на контейнер, прокручиваем к началу страницы
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }
    };

    // Запускаем прокрутку с небольшой задержкой для гарантии рендера
    const timer = setTimeout(smoothScroll, 100);
    return () => clearTimeout(timer);
  }, [currentPage]);

  if (totalPages <= 1) {
    return null; // Не показываем пагинацию, если всего одна страница
  }

  return (
    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
      <button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded text-sm transition ${
          currentPage === 1
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
      >
        &larr; Previous
      </button>
      
      <div className="text-gray-400 text-sm">
        Page {currentPage} of {totalPages}
      </div>
      
      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded text-sm transition ${
          currentPage === totalPages
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
      >
        Next &rarr;
      </button>
    </div>
  );
};

export default UserDepositsPagination;