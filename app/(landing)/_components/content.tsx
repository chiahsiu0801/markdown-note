"use client";

import { cn } from '@/lib/utils';
import { TypeAnimation } from 'react-type-animation';
import DocumentAnimation from './documentAnimation';
import { useEffect, useRef, useState } from 'react';
import FadeInSection from './fadeInSection';
import { AuthModal } from './authModal';
import { LogIn } from 'lucide-react';
import Image from 'next/image';
import { MdOutlineMailLock } from "react-icons/md";
import { FaGithub, FaGoogle, FaMailBulk } from 'react-icons/fa';

const Content = () => {
  const [animationInput, setAnimationInput] = useState('');
  const [authModalClick, setAuthModalClick] = useState(false);

  const animationSpanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const targetNode = animationSpanRef.current;

    if (targetNode) {
      const config = { childList: true, subtree: true, characterData: true };

      const callback = (mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            setAnimationInput(targetNode.innerText);
          }
        }
      };

      const observer = new MutationObserver(callback);

      observer.observe(targetNode, config);

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <>
      <div className="my-10">
        <AuthModal buttonText="Create your note now!" inContent={true} />
      </div>
      <main className="w-full mt-20 flex flex-col items-center md:flex-row justify-center max-w-full">
        <div className="w-full md:w-3/5 max-w-3/5 flex flex-col items-center xl:flex-row my-10">
          <div
            className="w-[calc(100%-36px)] xl:w-[calc(50%-16px)] h-[310px] md:h-[500px] rounded-lg bg-slate-400 border-2 border-slate-400 mx-2 py-4 px-2 shadow-lg shadow-black/60 flex overflow-y-scroll"
          >
            <div
              className="w-12 pr-3 text-right text-lg font-mono rounded-lg rounded-r-none bg-slate-400 text-gray-600 border-gray-300"
            >
              <div>
                {
                  Array.from({length: 16}).map((_, index) => {
                    return <div key={index} className={cn(`h-[28px] pt-[2px]`, index === 0 && `text-[#e6edf3]`)}>{index + 1}</div>;
                  })
                }
              </div>
            </div>
            <div className="w-[calc(100%-48px)] font-mono pt-[2px] leading-7">
              <TypeAnimation
                ref={animationSpanRef}
                preRenderFirstString={true}
                sequence={[
                  `## Basic annotations:\n# Header 1\n## Header 2\n### Header 3\n* List 1\n* List 2\n1. One\n2. Two\n3. Three`,
                  1000,
                  `## Syntax highlighting:\n\`\`\`js\nconsole.log('Hello World !')\n\`\`\`\n\`\`\`python\nprint('Hello World !')\n\`\`\`\n\`\`\`c\nprintf("Hello! World!");\n\`\`\``,
                  1000,
                  `## Other common usages:\n[Link](http://a.com)\n> Blockquote\n\n\`Inline code\` with backticks\n\n~~strikethrough~~\n\n*Italic*\n\n**Bold**\n* [ ] task list\n* [x] checked item`,
                  1000,
                  '',
                ]}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
                style={{ whiteSpace: 'pre-wrap', fontSize: '18px', display: 'inline-block' }}
              />
            </div>
          </div>
          <div className="w-10 xl:w-0.5 h-0.5 xl:h-32 my-2 xl:my-auto xl:mt-[186px] bg-black rounded-lg"></div>
          <div
            className="w-[calc(100%-36px)] xl:w-[calc(50%-16px)] h-[310px] md:h-[500px] rounded-lg bg-slate-400 border-2 border-slate-400 mx-2 py-4 px-2 shadow-lg shadow-black/60 overflow-y-scroll"
          >
            <div className="w-full max-w-full font-mono pt-[2px] leading-7">
              <DocumentAnimation animationInput={animationInput} />
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/5 py-4">
          <FadeInSection>
            <p className="text-base md:text-xl my-4 text-center px-4 md:px-2">
                Welcome to Markdown note, the ultimate tool for creating and managing your notes with ease. Our platform supports a wide range of features designed to enhance your writing experience, including:<br /><br />

                <span className='font-bold'>- Basic Markdown Syntax</span><br /><br />
                <span className='font-bold'>- Syntax Highlighting</span><br /><br />
                <span className='font-bold'>- User-Friendly Interface</span><br /><br />
                <span className='font-bold'>- Cross-Platform Compatibility</span><br /><br />
                Join us today and start organizing your thoughts efficiently with Markdown note!
            </p>
          </FadeInSection>
        </div>
      </main>
      <div className='flex flex-col-reverse md:flex-row h-[750px] my-20 justify-center items-center'>
        <div className='w-full md:w-1/2 px-4'>
          <FadeInSection>
            <div className='text-base md:text-xl text-center px-4 md:px-2'>
              We make it easy for you to create and manage your notes with<br /> seamless account integration options.<br /> You can:<br /><br />

              <div className='flex justify-center gap-4 mb-2'>
                <FaGithub size={40} />
                <FaGoogle size={40} />
              </div>
              <div>
                <span className='font-bold'>Bind Your GitHub or Google Account:</span><br/> Quickly sign in and get started by linking your existing GitHub or Google account.<br /><br />
              </div>
              <FaMailBulk size={40} className='mx-auto mb-2' />
              <div>
                <span className='font-bold'>Create an Account with Email and Password:</span><br /> Simply create an account with your email address and a password.<br /><br />
              </div>
              Once your account is set up, you&apos;ll have access to a wide range of features like: Browse Your Notes, Search Functionality and Edit Your Notes ...
            </div>
          </FadeInSection>
        </div>
        <div className="flex-1">
          <div className="w-[300px] md:w-[400px] lg:w-[550px] h-[300px] md:h-[400px] lg:h-[550px] relative block mx-auto">
            <Image src="/documents.png" alt="documents" fill sizes="600" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </>
   );
}
 
export default Content;