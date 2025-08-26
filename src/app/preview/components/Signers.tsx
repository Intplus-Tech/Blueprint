import { useContext, useState } from "react";
import { AuthModal } from "./siginModal";
import { UserContext } from "@/app/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const Signers = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const [isLoading, setIsLoading] = useState(false);
  const auth = !!userAuth?.access_token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const documentId = sessionStorage.getItem("documentId");
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/api/documents/${documentId}/signers`,
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      toast.success(data.message);
      const esc = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(esc);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "Something went wrong");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
      setFirstName("");
      setLastName("");
      setEmail("");
    }
  };

const fakeClose = () => {
  const esc = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
  document.dispatchEvent(esc);
};

  return (
    <div className="w-full">
      {auth ? (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="p-3 max-w-lg mx-auto"
        >
          <h3 className="text-gray-600 text-lg font-semibold mb-4">
            New Signer
          </h3>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-black"
          >
            {/* First + Last name inputs */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="first-name" className="block mb-1 text-sm font-medium">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  id="first-name"
                  placeholder="First name"
                  className="border p-2 rounded w-full focus:outline-blue-400"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block mb-1 text-sm font-medium">
                  Last name
                </label>
                <input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  placeholder="Last name"
                  className="border p-2 rounded w-full focus:outline-blue-400"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex-1">
              <label htmlFor="email" className="block mb-1 text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email address"
                className="border p-2 rounded w-full focus:outline-blue-400"
              />
            </div>

            {/* Add more signer checkbox */}
        

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                onClick={fakeClose}
                type="button"
                className="px-4 py-2 border rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                  </svg>
                ) : (
                  "Send Invite"
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div
          className="flex flex-col gap-1 p-3 max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <p className="text-black font-bold">Add Co-Signer(s)</p>
          <span className="font-light text-sm">
            <AuthModal /> Add people to sign the same
          </span>
          <span className="font-light text-sm">document with you.</span>
        </div>
      )}
    </div>
  );
};

export default Signers;
