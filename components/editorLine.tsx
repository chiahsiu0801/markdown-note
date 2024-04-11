type EditorLineProps = {
  row: string;
};

const EditorLine = ({ row }: EditorLineProps) => {
  return ( 
    <div className="w-full h-[28px] whitespace-pre-wrap break-words leading-6">
      <span>
        <span className="text-lg h-[28px] block">{row}</span>
      </span>
    </div>
   );
}
 
export default EditorLine;