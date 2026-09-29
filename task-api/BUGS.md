# Bug Report — Take-Home Assignment

During the testing and review of the Task Manager API, I identified three issues in the existing implementation. Two of these issues were fixed as part of the assignment, while the third issue was documented as an additional finding.

---

## Bug 1 — Pagination Starts From the Wrong Offset

**File:** `src/services/taskService.js`

**Function:** `getPaginated(page, limit)`

### Problem

The original pagination implementation calculated the offset using:

```js
const offset = page * limit;
For example, when requesting:
GET /tasks?page=1&limit=10

the calculated offset was:
1 * 10 = 10

This caused the first page to start from the 11th task instead of the first task.
The expected behavior is:
Page 1 → Tasks 1–10
Page 2 → Tasks 11–20
Page 3 → Tasks 21–30

How I found the bug
I wrote a unit test for the pagination functionality and created multiple tasks. When requesting page 1 with a limit of 10, the test expected the first returned task to be Task 1.
The original implementation skipped the first 10 tasks, which showed that the pagination offset was incorrect.
Fix
I changed the calculation from:
const offset = page * limit;

to:
const offset = (page - 1) * limit;

The updated implementation is:
const getPaginated = (page, limit) => {
  const offset = (page - 1) * limit;
  return tasks.slice(offset, offset + limit);
};

Result after the fix
Pagination now starts at the correct position:
Page 1 → offset 0  → Tasks 1–10
Page 2 → offset 10 → Tasks 11–20
Page 3 → offset 20 → Tasks 21–30

The pagination tests passed successfully after the change.
Bug 2 — Completing a Task Changes Its Priority
File: src/services/taskService.js
Function: completeTask(id)
Problem
The original implementation contained:
const updated = {
  ...task,
  priority: 'medium',
  status: 'done',
  completedAt: new Date().toISOString(),
};

The problem was that completing a task automatically changed its priority to medium.
For example, if a task originally had:
priority: high
status: todo

completing the task changed it to:
priority: medium
status: done

Changing the task status to done should not unexpectedly modify its existing priority.
How I found the bug
While testing the completeTask() behavior, I created a high-priority task and then marked it as completed.
The test showed that the task's priority changed from high to medium, even though the completion operation should only update the completion-related fields.
Fix
I removed the unnecessary priority assignment.
The updated implementation is:
const updated = {
  ...task,
  status: 'done',
  completedAt: new Date().toISOString(),
};

Result after the fix
A high-priority task now behaves as expected:
Before completion:
status   → todo
priority → high

After completion:
status   → done
priority → high
completedAt → populated with the completion timestamp

The task completion tests passed successfully after the fix.
Bug 3 — Status Filtering Uses Partial Matching
File: src/services/taskService.js
Function: getByStatus(status)
Problem
The original implementation uses:
const getByStatus = (status) => tasks.filter((t) => t.status.includes(status));

The API defines specific task statuses:
todo
in_progress
done

The status filter should normally compare the requested status with the complete status value.
However, includes() performs partial string matching rather than exact matching.
For example:
GET /tasks?status=todo

should return tasks whose status is exactly:
todo

but the current implementation checks whether the task's status contains the requested value.
How I found the issue
While reviewing the status filtering implementation and writing tests for the status filter, I noticed that the service uses:
t.status.includes(status)

instead of an exact comparison.
Since the application already defines a fixed set of valid statuses, exact matching would make the filter behavior more predictable.
Recommended fix
The implementation could be changed to:
const getByStatus = (status) => tasks.filter((t) => t.status === status);

This would ensure that only tasks with the exact requested status are returned.
Result
This issue was identified and documented but was not changed as part of the assignment.
The assignment required at least one bug to be fixed, and the pagination issue and task completion priority issue were fixed and covered by tests. I left this additional finding documented rather than making an unnecessary change without further clarification of the expected API behavior.
Summary
The following issues were identified during testing and code review:
1. Pagination started from the wrong offset — Fixed
2. Completing a task changed its priority — Fixed
3. Status filtering used partial matching — Identified and documented
After implementing the fixes, the complete test suite was executed successfully:
Test Suites: 3 passed, 3 total
Tests:       49 passed, 49 total

The final coverage result was:
Statements: 96.12%
Branches:   91.95%
Functions:  93.10%
Lines:      95.74%

The newly implemented PATCH /tasks/:id/assign endpoint was also manually tested using Postman. A task was successfully assigned to:
{
  "assignee": "Uday"
}

and the API returned the updated task successfully.

### Additional edge case — Reassigning an already assigned task

Once a task has been assigned to a user, attempting to assign the same task again with a different assignee is rejected.

For example, after assigning:

```json
{
  "assignee": "Uday"
}

attempting to assign the same task again:
{
  "assignee": "Another User"
}

returns:
400 Bad Request

with:
{
  "error": "Task is already assigned"
}

This prevents an existing assignment from being overwritten accidentally.