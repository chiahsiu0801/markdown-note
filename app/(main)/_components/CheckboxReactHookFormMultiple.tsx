"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { NoteDocument } from "@/lib/models";
import { useState } from "react"
import { createNote, deleteNotes } from "@/lib/action"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchNotes, toggleIsDeleting } from "@/lib/features/note/noteSlice"
import { usePathname, useRouter } from "next/navigation"
import { RootState } from "@/lib/store"

type CheckboxReactHookFormMultipleProps = {
  items: NoteDocument[];
  transitioning: boolean;
}

const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
})

export function CheckboxReactHookFormMultiple({ items, transitioning }: CheckboxReactHookFormMultipleProps) {
  const pathname = usePathname().split('/');
  const noteId = pathname[pathname.length - 1];

  const router = useRouter();
  
  const dispatch = useAppDispatch();
  const { notes } = useAppSelector((state: RootState) => state.notes);
  const [checkedCount, setCheckedCount] = useState(0);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log('data: ', data);

    const promise = deleteNotes(data.items);

    toast.promise(promise, {
      loading: checkedCount === 1 ? `Deleting 1 note...` : `Deleting ${checkedCount} notes...`,
      success: checkedCount === 1 ? '1 note deleted!' : `${checkedCount} notes deleted!`,
      error: 'Failed to delete notes',
    });

    // Wait for the note creation to complete
    await promise;
    // Toggle the state to trigger a re-render of Notes
    // setIsDeleting(false);
    dispatch(toggleIsDeleting())
    dispatch(fetchNotes());

    if(data.items.includes(noteId) && data.items.length !== notes.length) {
      let latestNoteId; 

      for(let i = notes.length - 1; i >= 0; i--) {
        const id = notes[i]._id;

        if(!data.items.includes(id)) {
          latestNoteId = id;

          break;
        }
      }

      router.push(`/notes/${latestNoteId}`);
    } else if(data.items.includes(noteId) && data.items.length === notes.length) {
      const promise = createNote();

      toast.promise(promise, {
        loading: 'Creating a new note...',
        success: 'New note created!',
        error: 'Failed to create a new note',
      });

      // Wait for the note creation to complete
      const createdNote = await promise;

      console.log('createdNote', createdNote);
      
      dispatch(fetchNotes());

      router.push(`/notes/${createdNote._id}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="items"
          render={() => (
            <FormItem>
              {items.map((item) => (
                <FormField
                  key={item._id}
                  control={form.control}
                  name="items"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item._id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <label className="group min-h-[28px] text-sm pl-4 py-1 pr-3 w-full hover:bg-primary/5 flex items-center font-medium">
                        <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item._id)}
                              onCheckedChange={(checked) => {
                                if(checked) {
                                  setCheckedCount(prevState => prevState + 1);
                                } else {
                                  setCheckedCount(prevState => prevState - 1);
                                }

                                return checked
                                  ? field.onChange([...field.value, item._id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item._id
                                      )
                                    )
                              }}
                              className={`ml-1 h-[18px] mr-3 transition-opacity duration-100 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
                            />
                        </FormControl>
                        <FormLabel className="font-medium text-sm">
                          {item.title}
                        </FormLabel>
                        </label>
                      </FormItem>
                    )
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="destructive" type="submit" className="ml-4">{`Delete ${checkedCount} notes`}</Button>
      </form>
    </Form>
  )
}
