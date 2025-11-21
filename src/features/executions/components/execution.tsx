"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";
import { useSuspenseExecution } from "@/features/executions/hooks/use-executions";
import { ExecutionStatus } from "@/generated/prisma/enums";
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircleIcon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircleIcon className="-mt-1 size-5 text-green-600" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="-mt-1 size-5 text-red-600" />;
    case ExecutionStatus.RUNNING:
      return (
        <Loader2Icon className="-mt-1 size-5 text-blue-600 animate-spin" />
      );
    default:
      return <ClockIcon className="-mt-1 size-5 text-muted-foreground" />;
  }
};

const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const duration = execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000
      )
    : null;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div>
            <CardTitle>
              <div className="flex gap-2">
                {getStatusIcon(execution.status)}{" "}
                {formatStatus(execution.status)}
              </div>
            </CardTitle>
            <CardDescription>
              Execution for {execution.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Workflow
            </p>
            <Link
              prefetch // be wary when using / excess network resources for no reason
              href={`/workflows/${execution.workflowId}`}
              className="text-sm hover:underline text-primary"
            >
              {execution.workflow.name}
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm">{formatStatus(execution.status)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Started</p>
            <p className="text-sm">
              {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
            </p>
          </div>
          {execution.completedAt && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed
              </p>
              <p className="text-sm">
                {formatDistanceToNow(execution.completedAt, {
                  addSuffix: true,
                })}
              </p>
            </div>
          )}
          {duration && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="text-sm">{duration}s</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Event ID
            </p>
            <p className="text-sm">{execution.inngestEventId}s</p>
          </div>
        </div>
        {execution.error && (
          <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-900 font-mono">
                {execution.error}
              </p>
            </div>
          </div>
        )}
        {execution.errorStack && (
          <Collapsible open={showStackTrace} onOpenChange={setShowStackTrace}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-900 hover:bg-red-100"
              >
                {showStackTrace ? "Hide stack trace" : "Show stack trace"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="text-sm font-mono text-red-800 overflow-auto mt-2 p-2 bg-red-100 rounded">
                {execution.errorStack}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
        {execution.output && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <div>
              <p className="text-sm font-medium">Output</p>
              <pre className="text-xs font-mono overflow-auto">
                {JSON.stringify(execution.output, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutionView;
