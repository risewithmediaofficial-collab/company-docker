// =============================================
// ADD TASK FORM - React Hook Form + Zod
// =============================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useUsers } from '../../hooks/useUsers';

const EMPTY_INITIAL_VALUES = {};

const taskFormSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'In Review', 'Approved', 'Done', 'Blocked']).default('To Do'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  taskType: z.enum(['task', 'content', 'website_content', 'non_content', 'reel', 'poster', 'video']).default('task'),
  project: z.string().min(1, 'Please select a project'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  estimatedHours: z.number().optional(),
  isClientVisible: z.boolean().default(false),
});

const buildDefaultValues = (initialValues = {}) => ({
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Medium',
  taskType: 'task',
  project: '',
  startDate: '',
  dueDate: '',
  assignedTo: '',
  estimatedHours: undefined,
  isClientVisible: false,
  ...initialValues,
});

export const AddTaskModal = ({ open, onOpenChange, task = null, initialValues = EMPTY_INITIAL_VALUES }) => {
  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: buildDefaultValues(initialValues),
  });

  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isLoading = createTask.isPending || updateTask.isPending;
  const assignableUsers = users.filter((user) => ['superAdmin', 'manager', 'employee'].includes(user.role));

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        taskType: task.taskType || 'task',
        project: task.project?._id || '',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo?.[0]?._id || '',
        estimatedHours: task.estimatedHours || undefined,
        isClientVisible: Boolean(task.isClientVisible),
      });
    } else {
      form.reset(buildDefaultValues(initialValues));
    }
  }, [task, open, form, initialValues]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      assignedTo: data.assignedTo || undefined,
      estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
    };

    if (task) {
      await updateTask.mutateAsync({ id: task._id, data: payload });
    } else {
      await createTask.mutateAsync(payload);
    }

    if (!createTask.isError && !updateTask.isError) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Task Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Design homepage mockups" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="website_content">Website Content</SelectItem>
                        <SelectItem value="non_content">Non Content</SelectItem>
                        <SelectItem value="reel">Reel</SelectItem>
                        <SelectItem value="poster">Poster</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {projects.length === 0 && (
                      <p className="text-xs text-muted-foreground">Create a project before adding tasks.</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === 'unassigned' ? '' : value)} value={field.value || 'unassigned'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {assignableUsers.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="8"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description and details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="isClientVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-border bg-secondary/20 p-4">
                  <div>
                    <FormLabel className="text-sm font-semibold">Visible in client portal</FormLabel>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || projects.length === 0}>
                {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
