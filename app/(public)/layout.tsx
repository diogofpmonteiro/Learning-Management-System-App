import { ReactNode } from "react";
import Navbar from "./_components/Navbar";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className=''>
      <Navbar />
      <main className='container mx-auto px-4 md:px-6 lg:px-8'>{children}</main>
    </div>
  );
};

export default PublicLayout;
