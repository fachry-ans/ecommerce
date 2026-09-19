import * as schema from "./schema";

type OrderItem = { id?: string; [key: string]: unknown };
type EventItem = { eventKey?: string; [key: string]: unknown };

// MOCKED — in-memory data store for AI Studio
const inMemoryOrders = new Map<string, OrderItem>();
const inMemoryEvents = new Map<string, EventItem>();

function createMockDb() {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (val: unknown[]) => void) => resolve([]);
      }
      return () => {
        if (prop === "insert") {
          return {
            values: async (data: OrderItem & EventItem) => {
              if (data?.id) inMemoryOrders.set(data.id, { ...data });
              if (data?.eventKey) inMemoryEvents.set(data.eventKey, { ...data });
              return [data];
            },
          };
        }
        if (prop === "update") {
          let updatedData: Record<string, unknown> = {};
          return {
            set: (data: Record<string, unknown>) => {
              updatedData = data;
              return {
                where: async () => {
                  for (const [id, order] of inMemoryOrders.entries()) {
                    inMemoryOrders.set(id, { ...order, ...updatedData });
                  }
                  return [updatedData];
                },
              };
            },
          };
        }
        if (prop === "select") {
          return {
            from: () => {
              const getItems = () => Array.from(inMemoryOrders.values());
              return {
                where: () => ({
                  limit: async (n: number) => getItems().slice(0, n),
                  then: (resolve: (val: unknown[]) => void) => resolve(getItems()),
                }),
                limit: async (n: number) => getItems().slice(0, n),
                then: (resolve: (val: unknown[]) => void) => resolve(getItems()),
              };
            },
          };
        }
        return new Proxy({}, handler);
      };
    },
  };

  return new Proxy({}, handler);
}

const mockDb = createMockDb() as unknown as ReturnType<typeof import("drizzle-orm/d1").drizzle>;

export function getDb() {
  return mockDb;
}

export const db = mockDb;
export { schema };

