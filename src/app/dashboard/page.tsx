"use client";
import { Button } from "@/components/ui/button";
import Header from "./components/Header";
import DocumentTable from "./components/DocumetTable";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../AppContext";
import { useRouter } from "next/navigation";

type Active = "document" | "invoices";
export default function Dashboard() {
  const [active, setActive] = useState<Active>("document");
  const { userAuth ,loading} = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const router = useRouter()

 useEffect(() => {
    // only redirect AFTER loading finishes
    if (!loading && !access_token) {
      router.push("/login");
    }
  }, [loading, access_token, router]);

  // while loading, just show a spinner or placeholder
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div className='bg-[#F3F3F6] h-screen'>
      <Header />
      <div className='flex items-center py-2 px-10'>
        <Button
          size={"lg"}
          onClick={() => setActive("document")}
          className={`rounded-none border-1 border-[#CBCBCB] hover:bg-transparent  bg-transparent text-[#636363] ${
            active === "document" && "text-blue-500 border-blue-500"
          }`}
        >
          Documents
        </Button>
        <Button
          size={"lg"}
          onClick={() => setActive("invoices")}
          className={`rounded-none border-1 border-[#CBCBCB] hover:bg-transparent  bg-transparent text-[#636363] ${
            active === "invoices" && "text-blue-500 border-blue-500"
          }`}
        >
          Invoices
        </Button>
        <Button
          size={"lg"}
          className='rounded-none border-1 border-[#CBCBCB] hover:bg-transparent  bg-transparent text-[#636363]'
        >
          Templates
        </Button>
      </div>
      {active === "document" && <DocumentTable />}
    </div>
  );
}
