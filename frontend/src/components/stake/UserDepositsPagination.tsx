import React, { useState, useEffect } from 'react';

interface UserDepositsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  containerRef?: React.RefObject<HTMLElement>; // Уточнили тип рефа
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

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Прокрутка к началу списка при смене страницы
  useEffect(() => {
    if (!isFirstLoad) {
      const smoothScrollToTop = () => {
        let start: number | null = null;
        const duration = 300; // Продолжительность анимации в миллисекундах
        
        // Определяем начальную позицию прокрутки
        const startPosition = window.pageYOffset || document.documentElement.scrollTop;

        const animateScroll = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const progressRatio = Math.min(progress / duration, 1);

          // Используем ease-out функцию для плавности
          const easeOutQuad = 1 - Math.pow(1 - progressRatio, 2);
          
          // Вычисляем новую позицию прокрутки
          const currentPosition = startPosition + (0 - startPosition) * easeOutQuad;
          
          window.scrollTo(0, currentPosition);

          if (progress < duration) {
            requestAnimationFrame(animateScroll);
          } else {
            // Убедимся, что точно докрутили до 0
            window.scrollTo(0, 0);
          }
        };

        requestAnimationFrame(animateScroll);
      };

      // Если есть реф на контейнер, скроллим к нему, иначе к верху страницы
      if (containerRef?.current) {
        const elementRect = containerRef.current.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const offsetPosition = absoluteElementTop - 100; // 100px отступ сверху

        let start: number | null = null;
        const duration = 300;
        const startPosition = window.pageYOffset || document.documentElement.scrollTop;

        const animateScrollToElement = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const progressRatio = Math.min(progress / duration, 1);
          const easeOutQuad = 1 - Math.pow(1 - progressRatio, 2);
          
          const currentPosition = startPosition + (offsetPosition - startPosition) * easeOutQuad;
          window.scrollTo(0, currentPosition);

          if (progress < duration) {
            requestAnimationFrame(animateScrollToElement);
          } else {
            window.scrollTo(0, offsetPosition);
          }
        };

        requestAnimationFrame(animateScrollToElement);
      } else {
        smoothScrollToTop();
      }
    } else {
      setIsFirstLoad(false);
    }
  }, [currentPage, containerRef]); // Добавили containerRef в зависимости

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