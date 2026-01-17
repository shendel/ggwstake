const SortToggle = (props) => {
  const { isReversed, onToggle } = props
  
  return (
    <button
      onClick={onToggle}
      className="ml-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center"
      title={isReversed ? "Sort oldest first" : "Sort newest first"}
    >
      {isReversed ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
          Oldest First
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          Newest First
        </>
      )}
    </button>
  );
};

export default SortToggle