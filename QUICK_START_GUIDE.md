# Schedule Manager Progress Tracking - Quick Start Guide

## For Employees/Team Members

### Logging Work Progress (3 Simple Steps)

#### Step 1: Open the Task
1. Go to **Tasks** page
2. Click on any task row to open task details
3. You'll see the "Progress" tab automatically selected

#### Step 2: Click "Add Progress Update"
- Click the blue **"+ Add Progress Update"** button
- A form will appear

#### Step 3: Fill and Submit
1. **What did you complete?** - Describe the work (required)
   - Example: "Completed login screen design and user testing"
2. **Hours Spent** - How long it took (optional)
   - Example: "3.5" or "2" or "0.5"
3. Click **"Log Progress"** button
4. Done! Your progress is now visible in the timeline

### What Happens Automatically
✅ Work start date is recorded (if first time)
✅ Task status changes to "In Progress" (if it was "To Do")
✅ Hours are added to total
✅ Your team sees the update in real-time
✅ Activity log is updated for audit trail

### View Your Progress Timeline
- Stay in the task detail view
- Your progress updates appear below the form
- Shows: **What was done** → **Who did it** → **When** → **Hours spent**
- See total hours logged vs estimated

---

## For Managers

### Creating Tasks with Time Estimates

#### When Creating a Task:
1. Click **"Add Task"** button
2. Fill in basic info:
   - **Task Title** - What needs to be done
   - **Project** - Which project it belongs to
   - **Priority** - How urgent (Low/Medium/High/Urgent)
3. **Set Dates:**
   - **Start Date** - When you plan work to begin
   - **Due Date** - When it's due
4. **Set Hours:**
   - **Estimated Hours** - How long it should take
   - Example: 8 hours for a design task, 16 hours for full feature
5. Assign to team member
6. Click **"Create Task"**

### Monitoring Team Progress

#### Open Task to See Progress
1. Click any task to open detail modal
2. You'll see tabs at top: **Progress** | **Details** | **Activity**
3. Click **Progress** tab to see:
   - **Work Started** - When they actually started
   - **Timeline** - All completed work items
   - **Hours Logged** - Total time spent so far
   - **Progress Bar** - Visual percentage of estimated hours used

#### What You'll See
Example progress timeline:
```
👷 Work Started
   May 15, 2026 at 9:30 AM
   (Started 2 days after planned May 13 date)

✅ Completed homepage wireframes
   Sarah Designer • May 15 at 2:30 PM
   3 hours

✅ Reviewed with design system specialist
   Sarah Designer • May 16 at 10:00 AM
   1.5 hours

✅ Final mockups and handoff to dev
   Sarah Designer • May 17 at 4:45 PM
   2 hours

Summary:
Total logged: 6.5h / 8h estimated
Status: On track
```

### Understanding Time Tracking

**Estimated Hours** = How long you think it should take
**Logged Hours** = How long it actually took
**Progress Bar** = (Logged / Estimated) × 100%

Examples:
- 4h logged / 8h estimated = 50% complete (on track)
- 8h logged / 8h estimated = 100% complete (done)
- 10h logged / 8h estimated = 125% complete (over estimate - check in with team)

### Key Insights You Get

1. **Real Start Date** - Know when work actually started vs planned
2. **Work Breakdown** - See exactly what was accomplished and in what order
3. **Time Accuracy** - Is your estimation getting better?
4. **Team Productivity** - How long does similar work actually take?
5. **Accountability** - Who did what and when (for audit purposes)

---

## Common Scenarios

### Scenario 1: Task Created, Employee Starts Work
```
Monday:
- Manager creates task "Design Newsletter"
- Estimated: 8 hours
- Start Date: Monday
- Due Date: Wednesday

Employee starts work
- Opens task (status: "To Do")
- Clicks "Add Progress Update"
- "Starting newsletter design research" - 0.5h

AUTO RESULT: ✓ Status changed to "In Progress"
             ✓ Actual start date recorded as Monday 9:30 AM
             ✓ Timeline shows work started
```

### Scenario 2: Task Takes Longer Than Expected
```
Wednesday Evening:
Manager checks task
- Estimated: 8h
- Logged so far: 7h
- Status: In Progress
- Due: Today

Progress updates show:
- Monday: 3h research
- Tuesday: 3h design
- Wednesday: 1h so far

Manager realizes it needs more time
- Changes Due Date to Friday
- Adds comment "Taking longer due to design feedback"
- Monitors closely
```

### Scenario 3: Quick Task, Done in Less Time
```
Employee logs progress:
- "Fixed button styling" - 0.5h
- "Updated across all pages" - 0.5h
- "Testing and QA" - 0.5h

Total: 1.5h logged / 4h estimated
Manager sees: Task completed ahead of schedule (37% of estimated time)
Decision: Can reassign employee to other tasks or add more to this one
```

---

## Tips & Best Practices

### For Employees
✅ **DO:**
- Log progress at end of each work session
- Be specific: "Fixed login bug in Safari" vs "Did some work"
- Include hours spent
- Log small increments (not just one big update)

❌ **DON'T:**
- Leave tasks un-updated for days
- Be vague in descriptions
- Round hours randomly

### For Managers
✅ **DO:**
- Review progress updates regularly
- Adjust estimates based on actual data
- Praise team for completing ahead of schedule
- Flag tasks that are getting over budget

❌ **DON'T:**
- Ignore progress data
- Set unrealistic estimates
- Blame team for time discrepancies (improve estimates)

---

## Keyboard Shortcuts & Quick Tips

### In Task Detail Modal
- **Tab** - Navigate between form fields
- **Shift+Enter** - Submit form (in textarea)
- **Escape** - Close modal

### On Tasks Page
- **Click** task row → Opens detail modal
- **Right-click** (coming soon) → Context menu with quick actions

---

## Troubleshooting

### "Progress description is required"
**Solution:** You left the "What did you complete?" field empty. Fill it in with what you accomplished.

### Hours not showing up
**Solution:** Make sure you enter a number. Hours can be decimals like 0.5, 1.5, 2.25, etc.

### Task not changing to "In Progress"
**Solution:** Progress status auto-change only happens on the first progress entry. If already started, you can manually change status in Details tab.

### Can't see task detail
**Solution:** You might not have access. Check if:
- You're assigned to the task
- You're the project manager
- Task is shared with you

---

## FAQ

**Q: Can I edit a progress entry?**
A: Not yet. Log new entries to add corrections.

**Q: What if I spent more time than estimated?**
A: That's fine! It happens. The system tracks it. Managers can see the variance.

**Q: Does logging time automatically close the task?**
A: No, you manually change status to "Done" when complete.

**Q: Who can see my progress updates?**
A: Everyone on the project + managers + admins.

**Q: Can I log 0 hours?**
A: Yes! Sometimes you're documenting progress without time tracking.

**Q: Is there a mobile app?**
A: Currently web-based. Mobile version coming soon.

---

## Need Help?

Check these files for more info:
- `PROGRESS_TRACKING_GUIDE.md` - Detailed API docs
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- Ask your project manager or admin

---

## What's Coming Soon

🚀 **Time Tracking Timer** - Click to start/stop work
📊 **Progress Reports** - Export timesheets
🔔 **Smart Alerts** - Notify when hours exceed estimate
⏰ **Auto-completion** - Close task when time is logged
📈 **Team Analytics** - See team velocity and productivity
🔗 **Integrations** - Connect to other tools

---

Happy tracking! 🎯
