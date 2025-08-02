import { AuthModal } from "./siginModal";

const AiModal = () => {
    const auth = true
  return (
    <div>
      {auth ? (
        <div>
          <div className='w-full flex-col space-x-3 space-y-4 p-4 gap-5'>
            <p className='text-2xl text-gray-500 '>AI Document Reviewer</p>

            <p>Do you want continue with AI Torney to Review your document.</p>

            <p className='text-sm text-gray-600'>
              By using you agree to AI Torney
              <span className='text-blue-600 underline px-1'>
                Terms & Condition
              </span>
              and
              <span className='text-blue-600 px-1 underline'>
                Privacy Policy
              </span>
              .
            </p>

            <div className='flex justify-end gap-2 mt-2'>
              <button
                type='button'
                className='px-3 py-2 border hover:bg-gray-100 rounded-xl'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-xl'
              >
                Review free
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div
            className='flex flex-col gap-1'
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className='text-black font-bold'>AI Review</p>
            <span className='font-extralight'>
              <AuthModal />
              Review and get recommendation
            </span>
            <span className='font-extralight'>
              about your document from our AI.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiModal;
