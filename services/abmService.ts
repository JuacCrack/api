import { BaseModel } from "../models/BaseModel";

export class AbmService {
  static async handle({
    table,
    method,
    where,
    body,
  }: {
    table: string;
    method: string;
    where?: string;
    [key: string]: any;
  }) {
    try {
      let decodedWhere: undefined;
      if (where) {
        console.log("Base64 where:", where);

        try {
          const cleanBase64 = where.replace(/[^a-zA-Z0-9+/=]/g, "");

          const decodedString = Buffer.from(cleanBase64, "base64").toString(
            "utf-8"
          );
          decodedWhere = JSON.parse(decodedString);

          console.log("Decoded object:", decodedWhere);
        } catch (err) {
          console.error("Error decoding Base64:", err);
        }
      }

      switch (method) {
        case "create":
          return await this.createRecord(table, body);
        case "update":
          if (!decodedWhere)
            throw new Error('Decoded "where" is required for update');
          return await this.updateRecord(table, body, decodedWhere);
        case "delete":
          if (!decodedWhere)
            throw new Error('Decoded "where" is required for delete');
          return await this.deleteRecord(table, decodedWhere);
        case "list":
          return await this.getRecords(
            table,
            body.cols,
            body.limit,
            decodedWhere
          );
        case "find":
          if (!decodedWhere)
            throw new Error('Decoded "where" is required for find');
          return await this.findRecord(table, decodedWhere);
        
          case "structure":
            return await this.getStructure(table);
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error(`Error handling method "${method}":`, error);
      throw error;
    }
  }

  private static async createRecord(
    table: string,
    data: Record<string, any> | Record<string, any>[]
  ) {
    try {
      const result = await BaseModel.insert(table, data);
      return result;
    } catch (error) {
      console.error("Error creating record:", error);
      throw error;
    }
  }

  private static async getStructure(table: string) {
    try {
      const result = await BaseModel.structure(table);
      return result;
    } catch (error) {
      console.error("Error fetching structure:", error);
      throw error;
    }
  }

  private static async updateRecord(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>
  ) {
    try {
      const result = await BaseModel.update(table, data, where);
      return result;
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  }

  private static async deleteRecord(table: string, where: Record<string, any>) {
    try {
      const result = await BaseModel.delete(table, where);
      return result;
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  }

  private static async getRecords(
    table: string,
    cols: string[] = ["*"],
    limit?: number,
    where?: any
  ) {
    try {
      switch (table) {
        case "tables":
          return await BaseModel.listTables();
        default:
          return await BaseModel.select(table, cols, limit, where || {});
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      throw error;
    }
  }

  private static async findRecord(table: string, where: Record<string, any>) {
    try {
      const record = await BaseModel.find(table, where);
      return record;
    } catch (error) {
      console.error("Error finding record:", error);
      throw error;
    }
  }
}
