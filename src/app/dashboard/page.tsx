import { Button } from "@/components/ui/button";
import Header from "./components/Header";
import DocumentTable from "./components/DocumetTable";

export default function Dashboard(){
    return (
     <div className="bg-[#F3F3F6] h-screen">
     <Header />
     <div className="flex items-center py-2 px-10">
        <Button size={"lg"} className="rounded-none border-1 border-[#CBCBCB]  bg-transparent text-[#636363]">Documents</Button>
        <Button size={"lg"} className="rounded-none border-1 border-[#CBCBCB]  bg-transparent text-[#636363]">Documents</Button>
        <Button size={"lg"} className="rounded-none border-1 border-[#CBCBCB]  bg-transparent text-[#636363]">Documents</Button>
      
       
     </div>

     <DocumentTable />
     </div>
    )
}