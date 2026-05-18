# Task Progress Tracking Feature Guide

## Overview
The schedule manager now supports tracking work progress by allowing users to:
- Set when work **started** (automatically tracked)
- Log what work was **completed** with descriptions
- Track **hours spent** on work
- View complete **progress timeline**

## Backend Implementation

### New Database Fields
All changes are in the `Task` model:

#### `actualStartDate` (Date)
- Automatically set when first progress update is logged
- Tracks when work actually began (different from planned `startDate`)

#### `progressUpdates` (Array)
Array of progress entry objects, each containing:
```javascript
{
  description: String,      // What work was completed (required)
  hours: Number,           // Hours spent on this work (optional, default: 0)
  completedAt: Date,       // When logged (auto-set to now)
  updatedBy: ObjectId,     // Reference to User who logged it
}
```

## API Endpoints

### 1. Create Progress Update
**Endpoint:** `POST /tasks/:id/progress`

**Auth Required:** superAdmin, manager, employee

**Request Body:**
```json
{
  "description": "Completed the homepage design mockups",
  "hours": 4
}
```

**Response:**
```json
{
  "success": true,
  "task": {
    "_id": "task-id",
    "title": "Design Homepage",
    "actualStartDate": "2026-05-15T09:30:00Z",
    "progressUpdates": [
      {
        "_id": "update-1",
        "description": "Completed the homepage design mockups",
        "hours": 4,
        "completedAt": "2026-05-15T14:30:00Z",
        "updatedBy": {
          "_id": "user-id",
          "name": "John Doe",
          "avatar": "..."
        }
      }
    ],
    "loggedHours": 4,
    "status": "In Progress",
    // ... other task fields
  }
}
```

**Behaviors:**
- Automatically sets `actualStartDate` if not already set
- Automatically changes task status to "In Progress" on first progress update
- Adds hours to `loggedHours` field
- Creates activity log entry

## Frontend Implementation

### 1. Using the Hook

```jsx
import { useAddProgressUpdate } from '../../hooks/useTasks';

const MyComponent = () => {
  const addProgress = useAddProgressUpdate();

  const handleAddProgress = async () => {
    await addProgress.mutate({
      id: taskId,
      data: {
        description: "Fixed bug in authentication module",
        hours: 2
      }
    });
  };

  return (
    <button onClick={handleAddProgress} disabled={addProgress.isPending}>
      Add Progress
    </button>
  );
};
```

### 2. Progress Update Form Component

```jsx
import { useState } from 'react';
import { useAddProgressUpdate } from '../../hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const ProgressUpdateForm = ({ taskId, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const addProgress = useAddProgressUpdate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addProgress.mutate({
      id: taskId,
      data: {
        description,
        hours: Number(hours) || 0
      }
    });
    
    // Reset form
    setDescription('');
    setHours('');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          What did you complete?
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the work you completed..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Hours Spent (optional)
        </label>
        <Input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="0"
          min="0"
          step="0.5"
        />
      </div>

      <Button 
        type="submit" 
        disabled={!description.trim() || addProgress.isPending}
      >
        {addProgress.isPending ? 'Saving...' : 'Log Progress'}
      </Button>
    </form>
  );
};
```

### 3. Progress Timeline Display

```jsx
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Clock } from 'lucide-react';

export const ProgressTimeline = ({ task }) => {
  if (!task.progressUpdates || task.progressUpdates.length === 0) {
    return <p className="text-gray-500">No progress logged yet</p>;
  }

  return (
    <div className="space-y-4">
      {/* Work Start Info */}
      {task.actualStartDate && (
        <div className="flex gap-3 pb-4 border-b">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-medium">Work Started</p>
            <p className="text-sm text-gray-600">
              {new Date(task.actualStartDate).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Progress Updates */}
      {task.progressUpdates.map((update, idx) => (
        <div key={update._id} className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="font-medium">{update.description}</p>
            <p className="text-sm text-gray-600">
              {update.updatedBy.name} • {formatDistanceToNow(new Date(update.completedAt), { addSuffix: true })}
            </p>
            {update.hours > 0 && (
              <p className="text-sm font-medium text-blue-600 mt-1">
                ⏱️ {update.hours}h
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Total Hours */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm font-medium">
          Total Time Logged: <span className="text-blue-600">{task.loggedHours}h</span>
        </p>
        {task.estimatedHours > 0 && (
          <p className="text-sm text-gray-600">
            Estimated: {task.estimatedHours}h
          </p>
        )}
      </div>
    </div>
  );
};
```

### 4. Updating Task Form with Start Date

Add this to your task update form:

```jsx
import { useForm } from 'react-hook-form';

const taskFormSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum([...]),
  // ... other fields
  startDate: z.string().optional(), // Planned start
  actualStartDate: z.string().optional(), // Can set manually
  estimatedHours: z.number().optional(),
  // ...
});

export const TaskForm = ({ task }) => {
  const form = useForm({ resolver: zodResolver(taskFormSchema) });

  return (
    <Form {...form}>
      {/* ... other fields ... */}

      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Planned Start Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="actualStartDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Actual Start Date</FormLabel>
            <FormControl>
              <Input 
                type="datetime-local" 
                {...field}
                placeholder="Auto-set when first progress is logged"
              />
            </FormControl>
            <FormDescription>
              Automatically set when first progress update is logged
            </FormDescription>
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
                {...field}
                placeholder="Hours"
                step="0.5"
                min="0"
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* ... other fields ... */}
    </Form>
  );
};
```

## Usage Workflow

### Employee/Team Member Workflow
1. **Task Created** - Manager creates task with estimated hours and due date
2. **Start Work** - When starting, log first progress update
   - `actualStartDate` is automatically set
   - Status changes to "In Progress"
3. **Log Updates** - As work progresses, add progress updates
   - Describe what was done
   - Log hours spent
4. **Complete Task** - When done, update status to "Done"
   - `completedAt` is auto-set

### Manager Workflow
1. Create task with planned start date, estimated hours
2. View progress updates on task details
3. See actual start date vs planned start date
4. Track total logged hours vs estimated hours
5. View timeline of what was completed

## Data Example

```json
{
  "_id": "task-123",
  "title": "Design Mobile App UI",
  "status": "In Progress",
  "startDate": "2026-05-13",
  "actualStartDate": "2026-05-15T09:30:00Z",
  "dueDate": "2026-05-20",
  "completedAt": null,
  "estimatedHours": 16,
  "loggedHours": 10.5,
  "progressUpdates": [
    {
      "_id": "update-1",
      "description": "Created wireframes for home, profile, and settings screens",
      "hours": 4,
      "completedAt": "2026-05-15T14:30:00Z",
      "updatedBy": {
        "_id": "user-456",
        "name": "Sarah Designer",
        "avatar": "..."
      }
    },
    {
      "_id": "update-2",
      "description": "Designed color palette and typography system",
      "hours": 3.5,
      "completedAt": "2026-05-16T16:00:00Z",
      "updatedBy": {
        "_id": "user-456",
        "name": "Sarah Designer",
        "avatar": "..."
      }
    },
    {
      "_id": "update-3",
      "description": "Created interactive prototypes in Figma",
      "hours": 3,
      "completedAt": "2026-05-17T15:45:00Z",
      "updatedBy": {
        "_id": "user-456",
        "name": "Sarah Designer",
        "avatar": "..."
      }
    }
  ]
}
```

## Benefits

✅ **Real-time Progress Tracking** - See exactly what's being done on tasks
✅ **Time Management** - Compare actual hours logged vs estimated hours
✅ **Accountability** - Track who did what and when
✅ **Timeline View** - See complete history of work done
✅ **Smart Automation** - Auto-set start date on first progress entry
✅ **Activity Logs** - All updates recorded for audit trail

## API Integration Notes

- All timestamps use ISO 8601 format
- Hours are numbers (can be decimals: 2.5, 3.75, etc.)
- Progress updates are immutable (once created, cannot be edited)
- To add new progress, always create a new entry
- Activity logs automatically track all progress updates
- Socket.io broadcasts progress updates to project members in real-time
