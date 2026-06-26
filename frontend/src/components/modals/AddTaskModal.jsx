import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useClients } from '../../hooks/useClients';
import {
  BRANDING_AVAILABILITY_OPTIONS,
  CONTENT_AVAILABILITY_OPTIONS,
  CONTENT_TASK_TYPE_OPTIONS,
  CONTENT_MEDIA_TYPE_OPTIONS,
  VIDEO_TYPE_OPTIONS,
  NON_CONTENT_TASK_TYPE_OPTIONS,
  PAGE_OPTIONS,
  PRIORITY_OPTIONS,
  TASK_CATEGORY_OPTIONS,
  TASK_STATUS_OPTIONS,
  WEBSITE_TYPE_OPTIONS,
  formatTaskTypeLabel,
  isWebsiteTaskType,
  normalizeTaskStatusLabel,
  uploadFiles,
} from '../../utils/taskFields';

const EMPTY_INITIAL_VALUES = {};

const taskFormSchema = z.object({
  taskTitle: z.string().min(2, 'Task title is required'),
  taskCategory: z.enum(['content', 'non_content']),
  contentType: z.string().optional(),
  videoType: z.string().optional(),
  contentTitle: z.string().optional(),
  taskType: z.string().min(1, 'Task type is required'),
  client: z.string().min(1, 'Client is required'),
  project: z.string().min(1, 'Select a project first'),
  assignedTo: z.string().min(1, 'Assigned person is required'),
  priority: z.enum(PRIORITY_OPTIONS),
  dueDate: z.string().optional(),
  status: z.enum(TASK_STATUS_OPTIONS),
  description: z.string().optional(),
  scriptText: z.string().optional(),
  scriptLink: z.string().optional(),
  caption: z.string().optional(),
  referenceLink: z.string().optional(),
  editorGuide: z.string().optional(),
  hashtags: z.string().optional(),
  keywords: z.string().optional(),
  contentIdea: z.string().optional(),
  audioReference: z.string().optional(),
  shootInstructions: z.string().optional(),
  editingInstructions: z.string().optional(),
  websiteType: z.string().optional(),
  websiteRequirements: z.string().optional(),
  pagesNeeded: z.array(z.string()).default([]),
  contentAvailability: z.string().optional(),
  brandingAvailability: z.string().optional(),
  domainDetails: z.string().optional(),
  hostingDetails: z.string().optional(),
  adminCredentials: z.string().optional(),
  requiredFeatures: z.string().optional(),
  internalNotes: z.string().optional(),
  clientVisibleNotes: z.string().optional(),
  approvalRequired: z.boolean().default(true),
  isClientVisible: z.boolean().default(true),
  duplicateCount: z.preprocess((val) => Number(val) || 1, z.number().min(1).default(1)),
}).superRefine((data, ctx) => {
  if (data.taskCategory === 'content') {
    if (!data.caption?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['caption'], message: 'Caption is required for content tasks' });
    }
    if (!data.scriptText?.trim() && !data.scriptLink?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['scriptText'], message: 'Add script text or provide a script link' });
    }
  }

  if (data.taskCategory === 'non_content' && isWebsiteTaskType(data.taskType)) {
    if (!data.websiteType?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['websiteType'], message: 'Website type is required' });
    }
    if (!data.websiteRequirements?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['websiteRequirements'], message: 'Website requirements are required' });
    }
  }

  if (data.taskCategory === 'non_content' && !isWebsiteTaskType(data.taskType) && !data.description?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['description'], message: 'Requirements / description is required' });
  }
});

const buildDefaultValues = (initialValues = {}) => ({
  taskTitle: '',
  taskCategory: 'content',
  contentType: 'videos',
  videoType: 'reels',
  contentTitle: '',
  taskType: 'reel',
  client: '',
  project: '',
  assignedTo: '',
  priority: 'Medium',
  dueDate: '',
  status: 'To Do',
  description: '',
  scriptText: '',
  scriptLink: '',
  caption: '',
  referenceLink: '',
  editorGuide: '',
  hashtags: '',
  keywords: '',
  contentIdea: '',
  audioReference: '',
  shootInstructions: '',
  editingInstructions: '',
  websiteType: '',
  websiteRequirements: '',
  pagesNeeded: [],
  contentAvailability: '',
  brandingAvailability: '',
  domainDetails: '',
  hostingDetails: '',
  adminCredentials: '',
  requiredFeatures: '',
  internalNotes: '',
  clientVisibleNotes: '',
  approvalRequired: true,
  isClientVisible: true,
  duplicateCount: 1,
  ...initialValues,
});

const deriveTaskCategory = (task) => {
  if (task?.taskCategory) return task.taskCategory;
  return isWebsiteTaskType(task?.taskType) || NON_CONTENT_TASK_TYPE_OPTIONS.some((item) => item.value === task?.taskType)
    ? 'non_content'
    : 'content';
};

export const AddTaskModal = ({ open, onOpenChange, task = null, initialValues = EMPTY_INITIAL_VALUES, pageMode = false }) => {
  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: buildDefaultValues(initialValues),
  });

  const { data: projects = [] } = useProjects({}, { enabled: open });
  const { data: users = [] } = useUsers({ enabled: open });
  const { data: clients = [] } = useClients({}, { enabled: open });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isLoading = createTask.isPending || updateTask.isPending;
  const assignableUsers = users.filter((user) => ['superAdmin', 'manager', 'employee'].includes(user.role));
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  const taskCategory = form.watch('taskCategory');
  const contentType = form.watch('contentType');
  const videoType = form.watch('videoType');
  const taskType = form.watch('taskType');
  const selectedClientId = form.watch('client');
  const isVideoReelFlow = taskCategory === 'content' && contentType === 'videos';

  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return projects;
    return projects.filter((project) => (project.client?._id || project.client) === selectedClientId);
  }, [projects, selectedClientId]);

  useEffect(() => {
    if (task) {
      form.reset({
        taskTitle: task.taskTitle || task.title || '',
        taskCategory: deriveTaskCategory(task),
        contentType: task.contentType || 'videos',
        videoType: task.videoType || 'reels',
        contentTitle: task.contentTitle || '',
        taskType: task.taskType || 'reel',
        client: task.client?._id || task.client || '',
        project: task.project?._id || task.project || '',
        assignedTo: task.assignedTo?.[0]?._id || task.assignedTo?.[0] || '',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        status: normalizeTaskStatusLabel(task.status),
        description: task.description || '',
        scriptText: task.scriptText || '',
        scriptLink: task.scriptLink || '',
        caption: task.caption || '',
        referenceLink: task.referenceLink || '',
        editorGuide: task.editorGuide || '',
        hashtags: task.hashtags || '',
        keywords: task.keywords || '',
        contentIdea: task.contentIdea || '',
        audioReference: task.audioReference || '',
        shootInstructions: task.shootInstructions || '',
        editingInstructions: task.editingInstructions || '',
        websiteType: task.websiteType || '',
        websiteRequirements: task.websiteRequirements || '',
        pagesNeeded: task.pagesNeeded || [],
        contentAvailability: task.contentAvailability || '',
        brandingAvailability: task.brandingAvailability || '',
        domainDetails: task.domainDetails || '',
        hostingDetails: task.hostingDetails || '',
        adminCredentials: task.adminCredentials || '',
        requiredFeatures: task.requiredFeatures || '',
        internalNotes: task.internalNotes || '',
        clientVisibleNotes: task.clientVisibleNotes || '',
        approvalRequired: task.approvalRequired ?? true,
        isClientVisible: task.isClientVisible ?? true,
      });
      setExistingAttachments(task.attachments || []);
      setAttachmentFiles([]);
    } else {
      form.reset(buildDefaultValues(initialValues));
      setExistingAttachments([]);
      setAttachmentFiles([]);
    }
  }, [task, open, form, initialValues]);

  useEffect(() => {
    if (taskCategory === 'content' && !CONTENT_TASK_TYPE_OPTIONS.some((item) => item.value === taskType)) {
      form.setValue('taskType', 'reel');
    }
    if (taskCategory === 'non_content' && !NON_CONTENT_TASK_TYPE_OPTIONS.some((item) => item.value === taskType)) {
      form.setValue('taskType', 'website_development');
    }
  }, [taskCategory, taskType, form]);

  const togglePageNeeded = (page) => {
    const current = form.getValues('pagesNeeded') || [];
    const next = current.includes(page)
      ? current.filter((item) => item !== page)
      : [...current, page];
    form.setValue('pagesNeeded', next, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    const uploadedAttachments = await uploadFiles(attachmentFiles);
    const payload = {
      ...data,
      title: data.taskTitle,
      taskTitle: data.taskTitle,
      project: data.project || undefined,
      attachments: [...existingAttachments, ...uploadedAttachments],
      dueDate: data.dueDate || undefined,
      deadline: data.dueDate || undefined,
      assignedTo: data.assignedTo,
      pagesNeeded: data.pagesNeeded || [],
      duplicateCount: Number(data.duplicateCount) || 1,
    };

    if (task) {
      await updateTask.mutateAsync({ id: task._id, data: payload });
    } else {
      await createTask.mutateAsync(payload);
    }

    if (!createTask.isError && !updateTask.isError) {
      form.reset(buildDefaultValues(initialValues));
      setAttachmentFiles([]);
      setExistingAttachments([]);
      onOpenChange(false);
    }
  };

  const renderCommonAssignmentFields = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="taskTitle"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Task Title *</FormLabel>
            <FormControl>
              <Input placeholder="Enter task title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="client"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client._id} value={client._id}>
                    {client.name} {client.company ? `- ${client.company}` : ''}
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
        name="project"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select project first" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredProjects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
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
        name="assignedTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned Person *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Assign team member" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
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
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TASK_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {!task && (
        <FormField
          control={form.control}
          name="duplicateCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duplicate Count (Create multiple copies)</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="e.g. 30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );

  const SectionHeader = ({ title, subtitle }) => (
    <div className="border-b border-border/70 pb-2">
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      {subtitle ? <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p> : null}
    </div>
  );

  const renderContentFields = () => (
    <div className="space-y-6 rounded-2xl border border-border bg-secondary/20 p-5">
      <SectionHeader title="Content Task Setup" subtitle="Select content type, then video format if applicable." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="contentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'videos'}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select content type" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTENT_MEDIA_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isVideoReelFlow && (
          <FormField
            control={form.control}
            name="videoType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'reels'}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select video type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VIDEO_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="taskType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Format</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTENT_TASK_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {isVideoReelFlow && (
        <>
          <SectionHeader title="Reel / Video Brief" subtitle="Structured fields for editors and creators." />

          <FormField
            control={form.control}
            name="contentTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reel / Video Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Product launch hook reel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contentIdea"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Content Idea</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-20" placeholder="Core idea, hook, angle..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scriptText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-28" placeholder="Full script or talking points..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scriptLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Google Doc / Notion link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="editorGuide"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Editor Guide</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24" placeholder="Style, fonts, transitions, pacing..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="editingInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Editing Instructions</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24" placeholder="Cuts, overlays, text placement..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shootInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shoot Instructions</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24" placeholder="Location, framing, props, talent notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO / topic keywords" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Links</FormLabel>
                  <FormControl>
                    <Input placeholder="Inspiration / sample video link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="audioReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio / Music Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="Track name or audio link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Caption *</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24" placeholder="Post caption for this reel..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hashtags"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Hashtags</FormLabel>
                  <FormControl>
                    <Input placeholder="#brand #reels #marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}

      {!isVideoReelFlow && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="referenceLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference Link</FormLabel>
                <FormControl>
                  <Input placeholder="Inspiration / brand / sample link" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scriptText"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Script / Copy</FormLabel>
                <FormControl>
                  <Textarea className="min-h-28" placeholder="Enter script or copy..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Caption *</FormLabel>
                <FormControl>
                  <Textarea className="min-h-24" placeholder="Enter caption..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea className="min-h-20" placeholder="Additional notes..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderWebsiteFields = () => (
    <div className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="taskType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NON_CONTENT_TASK_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select website type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {WEBSITE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="websiteRequirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website Requirements *</FormLabel>
            <FormControl>
              <Textarea className="min-h-28" placeholder="Describe full website requirements..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Pages Needed</FormLabel>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
          {PAGE_OPTIONS.map((page) => {
            const checked = (form.watch('pagesNeeded') || []).includes(page);
            return (
              <label key={page} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePageNeeded(page)}
                />
                <span>{page}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="referenceLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design Reference Link</FormLabel>
              <FormControl>
                <Input placeholder="Reference design / inspiration link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contentAvailability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Availability</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTENT_AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandingAvailability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo / Branding Availability</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branding status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BRANDING_AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="domainDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain Details</FormLabel>
              <FormControl>
                <Input placeholder="Domain details" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hostingDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hosting Details</FormLabel>
              <FormControl>
                <Input placeholder="Hosting details" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adminCredentials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Credentials</FormLabel>
              <FormControl>
                <Textarea className="min-h-24" placeholder="Admin credentials or access notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requiredFeatures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Features</FormLabel>
              <FormControl>
                <Textarea className="min-h-24" placeholder="Contact form, payment gateway, booking form..." {...field} />
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
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea className="min-h-24" placeholder="Additional notes for the website task..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderNonContentCommonFields = () => (
    <div className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-4">
      <FormField
        control={form.control}
        name="taskType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Task Type *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {NON_CONTENT_TASK_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Requirements / Description *</FormLabel>
            <FormControl>
              <Textarea className="min-h-28" placeholder="Describe the work required..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="referenceLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reference Link</FormLabel>
            <FormControl>
              <Input placeholder="Reference link" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const formBody = (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="taskCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Task Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select task category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Selected Type</p>
                <p className="mt-1">{formatTaskTypeLabel(taskType)}</p>
              </div>
            </div>

            {renderCommonAssignmentFields()}

            {taskCategory === 'content' && renderContentFields()}
            {taskCategory === 'non_content' && (isWebsiteTaskType(taskType) ? renderWebsiteFields() : renderNonContentCommonFields())}

            <div className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="internalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-24" placeholder="Internal admin/team notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientVisibleNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Visible Notes</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-24" placeholder="Notes the client can see..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="isClientVisible"
                  render={({ field }) => (
                    <FormItem className="rounded-xl border border-border bg-background px-4 py-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(field.value)}
                          onChange={(event) => field.onChange(event.target.checked)}
                        />
                        <div>
                          <FormLabel className="cursor-pointer">Visible in client dashboard</FormLabel>
                          <p className="text-xs text-muted-foreground">Client can track this task in the portal.</p>
                        </div>
                      </label>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approvalRequired"
                  render={({ field }) => (
                    <FormItem className="rounded-xl border border-border bg-background px-4 py-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(field.value)}
                          onChange={(event) => field.onChange(event.target.checked)}
                        />
                        <div>
                          <FormLabel className="cursor-pointer">Client confirmation required</FormLabel>
                          <p className="text-xs text-muted-foreground">Enable Yes / No response workflow for the client.</p>
                        </div>
                      </label>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Attachments</FormLabel>
                <Input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  onChange={(event) => setAttachmentFiles(Array.from(event.target.files || []))}
                />
                {(existingAttachments.length > 0 || attachmentFiles.length > 0) && (
                  <div className="mt-3 rounded-xl border border-border bg-background p-3 text-sm">
                    {existingAttachments.length > 0 && (
                      <div>
                        <p className="font-semibold text-foreground">Existing files</p>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          {existingAttachments.map((file, index) => (
                            <li key={`${file.url || file.name}-${index}`}>{file.name || 'Attachment'}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {attachmentFiles.length > 0 && (
                      <div className={existingAttachments.length > 0 ? 'mt-3' : ''}>
                        <p className="font-semibold text-foreground">New files to upload</p>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          {attachmentFiles.map((file) => (
                            <li key={`${file.name}-${file.size}`}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
  );

  if (pageMode) {
    if (!open) return null;
    return formBody;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Advanced Task'}</DialogTitle>
        </DialogHeader>
        {formBody}
      </DialogContent>
    </Dialog>
  );
};
