type EditorProps = {
  input: string;
  setInput: (value: string) => void;
}

const Editor = ({ input, setInput }: EditorProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if(e.key === 'Tab') {
      e.preventDefault();

      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;

      const inputWithTab = input.substring(0, start) + '\t' + input.substring(end);
      setInput(inputWithTab);

      // Use setTimeout to ensure the cursor position is updated after textarea updates
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0)
    }
  }

  return ( 
    <textarea
      autoFocus
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      className="w-full h-full rounded-lg bg-slate-400 resize-none p-5 focus:outline-2 focus:outline-blue-400 focus:shadow-xl focus:shadow-black/60"
    />
  );
}
 
export default Editor;