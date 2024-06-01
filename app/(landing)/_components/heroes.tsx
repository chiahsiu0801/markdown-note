import Image from "next/image";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"]
});

const Heroes = () => {
  return (
    <div className="w-full flex flex-col items-center mt-20">
      <div className="text-center py-4 md:py-8 px-2">
        <h1 className={cn("font-semibold text-3xl md:text-5xl", font.className)}>Ready to Simplify Your Note-Taking?</h1>
        <p className="text-base md:text-xl my-4">Join <b>MARKDOWN NOTE</b> today and turn your thoughts into action with the ultimate markdown experience.
          <br />Sign up for free and start your journey towards organized, effortless note-taking.</p>
      </div>
      <div className="block md:flex w-full justify-center">
        <div className="w-[300px] md:w-[600px] h-[400px] md:h-[600px] relative mx-auto md:mx-0">
          <Image src="/reading.png" alt="reading" fill sizes="(max-width: 768px) 400vw, 500px" className="w-full h-full object-contain" priority={true} />
        </div>
        <div className="w-[600px] h-[600px] relative hidden md:block">
          <Image src="/note-taking.png" alt="note-taking" fill sizes="500" className="w-full h-full object-contain" />
        </div>
      </div>
      {/* <div className="h-[150px]">
        <Button size={"lg"} className="py-4 mt-[40px]">
          <LogIn className="mr-2" />
          <span>Create your note now!</span>
        </Button>
      </div> */}
    </div>
   );
}
 
export default Heroes;