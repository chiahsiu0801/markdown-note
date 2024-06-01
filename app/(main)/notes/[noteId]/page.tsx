import { getNote } from "@/lib/action";
import ResizePanelsPage from "./resizePanelsPage";
import { Metadata } from 'next'

type Props = {
  params: { noteId: string }
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  // read route params
  const id = params.noteId

  const note = await getNote(id);

  return {
    title: note.title,
  }
}

const SingleNotePage = () => {
  return (
    <>
      <ResizePanelsPage />
    </>
   );
}

export default SingleNotePage;