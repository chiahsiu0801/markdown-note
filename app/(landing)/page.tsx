import Heading from "./_components/heading";
import Heroes from "./_components/heroes";
import Footer from "./_components/footer";


const LandingPage = () => {
  return ( 
    <div className="min-h-screen flex flex-col items-center">
      <Heading />
      <Heroes />
      <Footer />
    </div>
   );
}
 
export default LandingPage;