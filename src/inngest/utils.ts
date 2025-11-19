import { Connection, Node } from "@/generated/prisma/client";
import { inngest } from "@/inngest/client";
import toposort from "toposort";

/**
 * Utility method used for sorting graph nodes for sequential execution
 *
 * @throws Error, Error<cyclic graph>
 * @param nodes Node[]
 * @param connections Edge[]
 * @returns Node[]
 */
export const topologicalSort = (
  nodes: Node[],
  connections: Connection[]
): Node[] => {
  // if no connections, return as is (no connections)
  if (connections.length === 0) {
    return nodes;
  }

  // else create the edges
  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  // Add nodes with no connection as self-edges to ensure they're exectued
  // create a set with all connected nodes
  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  // check each node to see if it's not included in the set (not connected to anything)
  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  // topological sort
  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    // remove duplicate nodes
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle (loop)");
    }
    throw error;
  } // try/catch

  // map sorted ids back into node objects
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
}; // topologicalSort

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  return inngest.send({
    name: "workflows/execute.workflow",
    data,
  });
};
