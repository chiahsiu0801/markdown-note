type EditorLineProps = {
  row: string,
  width: number,
};

const EditorLine = ({ row, width }: EditorLineProps) => {
  return (
    <div className={`w-[${width}px] h-[28px] whitespace-pre-wrap break-words leading-6`}>
      <span>
        <span className="text-lg">{row}</span>
      </span>
    </div>
  );
}
 
export default EditorLine;