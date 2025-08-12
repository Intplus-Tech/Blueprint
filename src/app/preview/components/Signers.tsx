import { useContext } from "react";
import { AuthModal } from "./siginModal";
import { UserContext } from "@/app/AppContext";

const Signers = () => {
    const { userAuth } = useContext(UserContext);
  
    const auth = userAuth?.access_token ? true : false;
  return (
    <div>
      {auth ? (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className='p-3'
        >
          <h3 className='text-gray-400 text-base font-semibold mb-2'>
            New Signer
          </h3>
          <form className='flex flex-col gap-2 text-black'>
            <div className='flex gap-2'>
              <div className='flex-1'>
                <label htmlFor='first-name' className='block mb-1'>
                  First name
                </label>
                <input
                  type='text'
                  id='first-name'
                  placeholder='First name'
                  className='border p-2 rounded w-full'
                />
              </div>
              <div className='flex-1'>
                <label htmlFor='lastName' className='block mb-1'>
                  Last name
                </label>
                <input
                  id='lastName'
                  type='text'
                  placeholder='Last name'
                  className='border p-2 rounded w-full'
                />
              </div>
            </div>
            <div className='flex-1'>
              <label htmlFor='email'>Email Address</label>
              <input
                id='email'
                type='email'
                placeholder='Email address'
                className='border p-2 rounded w-full'
              />
            </div>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='more' />
              <label
                htmlFor='more'
                className='text-blue-500 cursor-pointer text-sm'
              >
                Add more signer
              </label>
            </div>
            <div className='flex justify-end gap-2 mt-2'>
              <button type='button' className='px-3 py-1 border rounded'>
                Cancel
              </button>
              <button
                type='submit'
                className='px-3 py-1 bg-blue-500 text-white rounded'
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <div
            className='flex flex-col gap-1'
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className='text-black font-bold'>Add Co-Signer(s)</p>
            <span className='font-extralight'>
              <AuthModal />
              Add people to sign the same
            </span>
            <span className='font-extralight'>document with you.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signers;
