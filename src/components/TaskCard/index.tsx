import { Task } from "@/state/api";
import { format } from "date-fns";
import React from "react";
import { Card, CardContent, CardMedia, Typography, Chip, Stack } from "@mui/material";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  return (
    <Card sx={{ maxWidth: 400, borderRadius: 2, boxShadow: 3, mb: 2 }}>
      {task.attachments && task.attachments.length > 0 && (
        <CardMedia
          component="img"
          height="200"
          image={`/${task.attachments[0].fileURL}`}
          alt={task.attachments[0].fileName}
        />
      )}
      <CardContent>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
          {taskTagsSplit.map((tag) => (
            <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
          ))}
        </Stack>
        
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          TASK ID: {task.id}
        </Typography>
        
        <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
          {task.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {task.description || "No description provided"}
        </Typography>

        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Status:</strong> {task.status}
          </Typography>
          <Typography variant="body2">
            <strong>Priority:</strong> {task.priority}
          </Typography>
          <Typography variant="body2">
            <strong>Start Date:</strong>{" "}
            {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}
          </Typography>
          <Typography variant="body2">
            <strong>Due Date:</strong>{" "}
            {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}
          </Typography>
          <Typography variant="body2">
            <strong>Author:</strong>{" "}
            {task.author ? task.author.username : "Unknown"}
          </Typography>
          <Typography variant="body2">
            <strong>Assignee:</strong>{" "}
            {task.assignee ? task.assignee.username : "Unassigned"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskCard;