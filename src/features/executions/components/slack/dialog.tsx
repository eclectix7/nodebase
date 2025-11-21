import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter of underscore and contain only letters, numbers, and underscores.",
    }),
  content: z
    .string()
    .min(1, { message: "Content is required" })
    .max(2000, { message: "Slack messages cannot exceed 2000 characters" }),
  // we don't want to use url() so that we can still use templates with upstream results
  webhookUrl: z.string().min(1, { message: "Webhook URL is required" }),
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SlackFormValues>;
}

export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      content: defaultValues.content || "",
      webhookUrl: defaultValues.webhookUrl || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        content: defaultValues.content || "",
        webhookUrl: defaultValues.webhookUrl || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "slack";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("handleSubmit/", values);
    onSubmit(values);
    onOpenChange(false); // close the modal
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Slack Configuration</DialogTitle>
          <DialogDescription>
            Configure the webhook settings for this node.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="slack" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the result in other nodes with:{" "}
                    {`{{${watchVariableName}.response}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://slack.com/api/webhooks/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Steps in Slack:
                    <ol>
                      <li>
                        More &rArr; + New &rArr; Build Workflow &rArr; Choose
                        Event &rArr; From a Webhook
                      </li>
                      <li>Set Up Variables, Add Key "content" (type text)</li>
                      <li>Done &rArr; Continue</li>
                      <li>
                        Add steps &rArr; Send Message to a channel &rArr; Select
                        your channel &rArr; Insert variable (select "content")
                        &rArr; Save
                      </li>
                      <li>
                        (click) Starts with a webhook &rArr; Copy Web request
                        URL
                      </li>
                    </ol>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="New event occured..."
                      className="min-h-[80px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The message to send. Use {"{{variables}}"} for simple values
                    or {"{{json variable}}"} to stringify previous workflow data
                    objects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
