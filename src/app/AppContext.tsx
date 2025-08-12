"use client";
import React, { createContext, useEffect, useState } from "react";
import { lookInSession } from "./(auth)/components/session";

interface AppContextProps {
  children: React.ReactNode;
}

type UserAuthType = {
  access_token: string;
  csrf_token:string
};

type userContextType = {
  userAuth: UserAuthType | null;
  setUserAuth: (auth: UserAuthType | null) => void;
};

export const UserContext = createContext<userContextType>({
  userAuth: null,
  setUserAuth: () => {},
});

const AppContext = ({ children }: AppContextProps) => {
  const [userAuth, setUserAuth] = useState<UserAuthType | null>(null);

  useEffect(() => {
    try {
      const userInSession = lookInSession("user");
      if (userInSession) {
        const parsed = JSON.parse(userInSession);
        setUserAuth(parsed);
        console.log(parsed, "hello");
      }
    } catch (error) {
      console.error("Error parsing session data:", error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export default AppContext;
