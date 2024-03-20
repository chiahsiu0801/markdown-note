import Image from "next/image";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"]
});

const Heroes = () => {
  return (
    <div className="flex flex-col items-center mt-20">
      <div className="text-center py-8">
        <h1 className={cn("font-semibold text-5xl", font.className)}>Ready to Simplify Your Note-Taking?</h1>
        <p className="text-xl my-4">Join <b>MARKDOWN NOTE</b> today and turn your thoughts into action with the ultimate markdown experience.
          <br />Sign up for free and start your journey towards organized, effortless note-taking.</p>
      </div>
      <div className="flex items-center">
        <Image src="/reading.png" alt="reading" width={500} height={500} className="object-contain" />
        <Image src="/note-taking.png" alt="note-taking" width={500} height={500} className="object-contain" />
      </div>
    </div>
   );
}
 
export default Heroes;