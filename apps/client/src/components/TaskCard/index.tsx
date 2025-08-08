import { Task } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  return (
    <div 
      className="max-w-md bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      {task.attachments && task.attachments.length > 0 && (
        <Image
          src={`/${task.attachments[0].fileURL}`}
          alt={task.attachments[0].fileName}
          width={400}
          height={400}
          className="rounded-t-lg"
        />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                >
                  {" "}
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 flex items-center">
          TASK ID: {task.id}
        </p>
        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{task.title}</h5>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {task.description || "No description provided"}
        </p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          <strong>Status:</strong> {task.status}
        </p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          <strong>Priority:</strong> {task.priority}
        </p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          <strong>Start Date:</strong>{" "}
          {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}
        </p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          <strong>Due Date:</strong>{" "}
          {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}
        </p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          <strong>Author:</strong>{" "}
          {task.author ? task.author.username : "Unknown"}
        </p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          <strong>Assignee:</strong>{" "}
          {task.assignee ? task.assignee.username : "Unassigned"}
        </p>
      </div>
      
    </div>
  );
};

export default TaskCard;