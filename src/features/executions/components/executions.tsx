"use client";
import {
  EmptyView,
  EntityList,
  EntityContainer,
  EntityHeader,
  EntityPagination,
  ErrorView,
  LoadingView,
  EntityItem,
} from "@/components/entity-components";
import { useSuspenseExecutions } from "@/features/executions/hooks/use-executions";
import { useExecutionsParams } from "@/features/executions/hooks/use-executions-params";
import type { ExecutionModel } from "@/generated/prisma/models"; // deviated ~8:13:00
import {
  CheckCircleIcon,
  ClockIcon,
  KeyIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ExecutionStatus } from "@/generated/prisma/enums";
import Image from "next/image";
import { Execution } from "@/generated/prisma/client";

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = () => {
  return (
    <EntityHeader
      title="Executions"
      description="View your workflow execution history"
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions..." />;
};
export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions" />;
};
export const ExecutionsEmpty = () => {
  return (
    <EmptyView message="No executions found! Get started running your workflows." />
  );
};

const getStatusIcon = (string: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircleIcon className="size-5 text-green-600" />;
      break;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
      break;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
      break;
    default:
      <ClockIcon className="size-5 text-muted-foreground" />;
  }
};

export const ExecutionItem = ({
  data,
}: {
  data: Execution & {
    workflow: {
      id: string;
      name: string;
    };
  };
}) => {
  const duration = data.completedAt
    ? Math.round(
        (new Date(data.completedAt).getTime() -
          new Date(data.startedAt).getTime()) /
          1000
      )
    : null;

  const subtitle = (
    <>
      {data.workflow.name} &bull; Started{" "}
      {formatDistanceToNow(data.startedAt, { addSuffix: true })}
      {duration !== null && <>&bull; Took {duration}s</>}
    </>
  );

  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={data.status}
      subtitle={subtitle}
      image={
        <div className="flex items-center justify-center size-8">
          {/* <KeyIcon className="size-5 text-muted-foreground" />*/}
          {getStatusIcon(data.status)}
        </div>
      }
    />
  );
};
