import {
  createIdempotencyKey,
  isDeleteResult,
  isPaginatedResponse,
  isTaskDetail,
  isTaskListItem,
  type PaginatedResponse,
  type DeleteResult,
  type TaskDetail,
  type TaskListItem,
  type TaskMutationPayload,
  type TaskPriority,
  type TaskStatus,
  type TaskStatusMutationPayload,
} from '@neta/api-contracts';

import { NetaClientError } from '@/lib/api/errors';
import type { MeProfile, StoredInstance } from '@/lib/instance/types';
import { requireInstanceCapability } from '@/lib/instance/capabilities';
import { requestResource, type ResourceResult } from '@/lib/resource/api-client';
import { collectResourcePages } from '@/lib/resource/pagination';

export function listAllTasks(instance: StoredInstance, user: MeProfile, filters: TaskListFilters = {}) {
  return collectResourcePages((cursor) => listTasks(instance, user, { ...filters, ...(cursor ? { cursor } : {}) }));
}

export type TaskListFilters = {
  clientId?: string;
  cursor?: string;
  from?: string;
  priority?: TaskPriority;
  projectId?: string;
  search?: string;
  status?: TaskStatus;
  to?: string;
};

export function listTasks(
  instance: StoredInstance,
  user: MeProfile,
  filters: TaskListFilters,
): Promise<ResourceResult<PaginatedResponse<TaskListItem>>> {
  requireInstanceCapability(instance, 'freelancer.tasks.v1');
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return requestResource(instance, user, {
    cachePolicy: 'medium',
    filters,
    parser: parseTaskPage,
    path: query ? `tasks?${query}` : 'tasks',
    resource: 'tasks',
  });
}

export function getTaskDetail(
  instance: StoredInstance,
  user: MeProfile,
  taskId: string,
): Promise<ResourceResult<TaskDetail>> {
  requireInstanceCapability(instance, 'freelancer.tasks.v1');
  return requestResource(instance, user, {
    cachePolicy: 'medium',
    filters: { taskId },
    parser: parseTaskDetail,
    path: `tasks/${encodeURIComponent(taskId)}`,
    resource: 'tasks',
  });
}

export function createTask(
  instance: StoredInstance,
  user: MeProfile,
  payload: TaskMutationPayload,
): Promise<ResourceResult<TaskDetail>> {
  requireInstanceCapability(instance, 'freelancer.core-mutations.v1');
  return requestResource(instance, user, {
    body: payload,
    idempotencyKey: createIdempotencyKey('task-create'),
    invalidates: ['tasks', 'dashboard', 'projects', 'calendar'],
    method: 'POST',
    parser: parseTaskDetail,
    path: 'tasks',
    resource: 'tasks',
  });
}

export function updateTask(
  instance: StoredInstance,
  user: MeProfile,
  taskId: string,
  payload: TaskMutationPayload,
): Promise<ResourceResult<TaskDetail>> {
  requireInstanceCapability(instance, 'freelancer.core-mutations.v1');
  return requestResource(instance, user, {
    body: payload,
    invalidates: ['tasks', 'dashboard', 'projects', 'calendar'],
    method: 'PATCH',
    parser: parseTaskDetail,
    path: `tasks/${encodeURIComponent(taskId)}`,
    resource: 'tasks',
  });
}

export function updateTaskStatus(
  instance: StoredInstance,
  user: MeProfile,
  taskId: string,
  payload: TaskStatusMutationPayload,
): Promise<ResourceResult<TaskDetail>> {
  requireInstanceCapability(instance, 'freelancer.core-mutations.v1');
  return requestResource(instance, user, {
    body: payload,
    invalidates: ['tasks', 'dashboard', 'projects', 'calendar'],
    method: 'PATCH',
    parser: parseTaskDetail,
    path: `tasks/${encodeURIComponent(taskId)}`,
    resource: 'tasks',
  });
}

export function completeTask(
  instance: StoredInstance,
  user: MeProfile,
  taskId: string,
  version?: string | null,
): Promise<ResourceResult<TaskDetail>> {
  requireInstanceCapability(instance, 'freelancer.core-mutations.v1');
  return requestResource(instance, user, {
    body: version === undefined ? {} : { version },
    idempotencyKey: createIdempotencyKey('task-complete'),
    invalidates: ['tasks', 'dashboard', 'projects', 'calendar'],
    method: 'POST',
    parser: parseTaskDetail,
    path: `tasks/${encodeURIComponent(taskId)}/complete`,
    resource: 'tasks',
  });
}

export function deleteTask(
  instance: StoredInstance,
  user: MeProfile,
  taskId: string,
  version: string,
): Promise<ResourceResult<DeleteResult>> {
  requireInstanceCapability(instance, 'freelancer.core-mutations.v1');
  return requestResource(instance, user, {
    method: 'DELETE',
    ifMatch: version,
    invalidates: ['tasks', 'dashboard', 'projects', 'calendar'],
    parser: parseDeleteResult,
    path: `tasks/${encodeURIComponent(taskId)}`,
    resource: 'tasks',
  });
}

function parseTaskPage(value: unknown): PaginatedResponse<TaskListItem> {
  if (!isPaginatedResponse(value, isTaskListItem)) {
    throw new NetaClientError('SERVER_ERROR', 'Tasks API kontratı beklenen formatta değil.');
  }

  return value;
}

function parseTaskDetail(value: unknown): TaskDetail {
  if (!isTaskDetail(value)) {
    throw new NetaClientError('SERVER_ERROR', 'Task detail API kontratı beklenen formatta değil.');
  }

  return value;
}

function parseDeleteResult(value: unknown): DeleteResult {
  if (!isDeleteResult(value)) {
    throw new NetaClientError('SERVER_ERROR', 'Task delete API kontratı beklenen formatta değil.');
  }

  return value;
}
