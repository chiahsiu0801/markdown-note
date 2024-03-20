import Heading from "./_components/heading";
import Heroes from "./_components/heroes";
import Footer from "./_components/footer";
import Playground from "./_components/playground";


const LandingPage = () => {
  return ( 
    <div className="min-h-screen flex flex-col items-center">
      <Heading />
      <Heroes />
      <Playground />
      <Footer />
    </div>
   );
}
 
export default LandingPage;