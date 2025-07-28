"use client";
import { Button } from "@/components/ui/button";
import Header from "./components/Header";
import DocumentTable from "./components/DocumetTable";
import { useState } from "react";

type Active = "document" | "invoices";
export default function Dashboard() {
  const [active, setActive] = useState<Active>("document");
  return (
    <div className='bg-[#F3F3F6] h-screen'>
      <Header />
      <div className='flex items-center py-2 px-10'>
        <Button
          size={"lg"}
          onClick={() => setActive("document")}
          className={`rounded-none border-1 border-[#CBCBCB] hover:bg-transparent  bg-transparent text-[#636363] ${active === "document" && "text-blue-500 border-blue-500" }`}
        >
          Documents
        </Button>
        <Button
          size={"lg"}
           onClick={() => setActive("invoices")}
          className={`rounded-none border-1 border-[#CBCBCB] hover:bg-transparent  bg-transparent text-[#636363] ${active === "invoices" && "text-blue-500 border-blue-500" }`}
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
      {active === "document" && <DocumentTable /> }
    </div>
  );
}
