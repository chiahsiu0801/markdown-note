import { cn } from "@/lib/utils"

type EditorLineProps = {
  row: string,
  width: number,
  active: boolean,
};

const EditorLine = ({ row, width, active }: EditorLineProps) => {
  // let rowWithNbsp = row.trimEnd();
  let rowWithNbsp = row[row.length - 1] === ' ' ? row.substring(0, row.length - 1) : row;
  console.log('rowWithNbsp: ', rowWithNbsp.split(''));
  console.log('row: ', row.split(''));

  // if(row[row.length - 2] === ' ') {
  //   console.log('Add space');
  //   rowWithNbsp = row.substring(0, row.length - 1);
  // }

  return (
    <div className={cn(`w-[${width}px] h-[28px] whitespace-pre-wrap break-words leading-6`,
      active && `bg-[#cad0d86f]`
    )}>
      <span className="text-lg">{rowWithNbsp ? rowWithNbsp : '\n'}</span>
    </div>
  );
}
 
export default EditorLine;

// testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
// Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid, distinctio? Ipsam velit earum numquam tempora quos fuga ratione labore voluptates reprehenderit, explicabo aliquid delectus, ipsa iste, quam eaque aliquam tempore!
// Lorem ipsum dolor sit amet consectetur, adipisicing elit. Natus excepturi deleniti rem. Recusandae, debitis sunt. Sint obcaecati consectetur maiores! Dolorum, necessitatibus ipsam. Magni minus vitae, temporibus corrupti nihil assumenda laboriosam!