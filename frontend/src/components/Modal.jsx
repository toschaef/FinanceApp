const Modal = ({ isOpen, onClose, title, children, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/40 flex justify-center items-center z-50'>
      <div className='bg-white rounded-2xl shadow-lg w-full max-w-4xl p-8'>
        <h2 className='text-xl font-semibold mb-4'>{title}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className='flex flex-col gap-3'
        >
          {children}
          <div className='flex justify-end gap-2 mt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;