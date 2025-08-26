"use client"

const GoogleLoginButton = () => {
  const handleLogin = () => {
    // Hit your backend /google-login endpoint
    // This will redirect user to Google
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/auth/google-login`; 
    // replace with your Flask backend base URL
  };

  return (
    <button 
      onClick={handleLogin}
      className="px-4 py-2 bg-red-500 text-white rounded-lg"
    >
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
