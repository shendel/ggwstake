const LoadingOverlay = (props) => {
  const { isLoading, message = "Loading..." } = props
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-3"></div>
        <span className="text-white text-sm">{message}</span>
      </div>
    </div>
  );
};
export default LoadingOverlay