import Navbar from "./_components/navbar";
import Heroes from "./_components/heroes";
import Content from "./_components/content";
import Footer from "./_components/footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

const LandingPage = async () => {
  const session = await getServerSession(authOptions);

  if(session) {
    redirect('/notes');
  }

  return ( 
    <div className="min-h-screen flex flex-col items-center">
      <Navbar />
      <Heroes />
      <Content />
      <Footer />
    </div>
   );
}
 
export default LandingPage;