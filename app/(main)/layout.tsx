import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Note Dashboard',
}

const MainLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {

  return (
    <>
      {children}
    </>
   );
}
 
export default MainLayout;