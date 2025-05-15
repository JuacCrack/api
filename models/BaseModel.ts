import { db, dbname } from "../config/db";

export class BaseModel {

  static async select(
    table: string,
    cols: string[] = ["*"],
    limit?: number,
    where?: Record<string, any>
  ) {
    try {
      console.log("Select operation started");
      console.log("Table:", table);
      console.log("Columns:", cols);
      console.log("Limit:", limit);
      console.log("Where clause:", where);

      const columns = cols.join(", ");
      let query = `SELECT ${columns} FROM ${table}`;
      console.log("Initial query:", query);

      const values: any[] = [];
      if (where && Object.keys(where).length > 0) {
        const whereKeys = Object.keys(where);
        const whereClause = whereKeys.map((key) => `${key} = ?`).join(" AND ");
        query += ` WHERE ${whereClause}`;
        values.push(...Object.values(where));
        console.log("WHERE clause:", whereClause);
        console.log("Values for WHERE clause:", values);
      }

      if (limit !== undefined) {
        query += ` LIMIT ${limit}`;
        console.log("Query with LIMIT:", query);
      }

      const [rows] = await db.execute(query, values);
      console.log("Rows fetched:", rows);
      return rows;
    } catch (error) {
      console.error("Error in fetch operation:", error);
      throw error;
    }
  }

  static async structure(table: string) {
    try {
      console.log("Structure operation started");
      console.log("Table:", table);

      const columnQuery = `
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          COLUMN_KEY,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          CHARACTER_MAXIMUM_LENGTH,
          EXTRA
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      `;
      console.log("Column query:", columnQuery);

      const [columns, _] = await db.execute(columnQuery, [table]) as [Array<any>, any];
      console.log("Columns fetched:", columns);

      const structure = columns.map((col: any) => {
        return {
          columnName: col.COLUMN_NAME,
          dataType: col.DATA_TYPE,
          // isNullable: col.IS_NULLABLE === "YES",
          isPrimaryKey: col.COLUMN_KEY === "PRI",
          // isUnique: col.COLUMN_KEY === "UNI",
          // defaultValue: col.COLUMN_DEFAULT,
          // maxLength: col.CHARACTER_MAXIMUM_LENGTH,
          // extra: col.EXTRA,
        };
      });

      console.log("Final structure:", structure);
      return structure;
    } catch (error) {
      console.error("Error in structure operation:", error);
      throw error;
    }
  }

  static async listTables() {
    try {
      console.log("List tables operation started");

      const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()`;
      console.log("Query to list tables:", query);
      const [rows] = (await db.execute(query)) as [
        Array<{ TABLE_NAME: string | null }>,
        any
      ];

      const tableNames = rows
        .map((row) => row.TABLE_NAME)
        .filter((name) => name !== null);

      return tableNames;
    } catch (error) {
      console.error("Error in list tables operation:", error);
      throw error;
    }
  }

  static async insert(
    table: string,
    data: Record<string, any> | Record<string, any>[]
  ) {
    try {
      console.log("Insert operation started");
      console.log("Table:", table);
      console.log("Data:", data);

      const isArray = Array.isArray(data);
      console.log("Is data an array?", isArray);

      const rows = isArray ? data : [data];
      console.log("Rows to insert:", rows);

      if (rows.length === 0) throw new Error("Data array is empty");

      const firstRow = rows[0];
      console.log("First row:", firstRow);

      if (typeof firstRow !== "object" || Array.isArray(firstRow)) {
        throw new Error("Each row must be an object (not array)");
      }

      const keys = Object.keys(firstRow);
      console.log("Keys:", keys);

      const quotedKeys = keys.map((key) => `\`${key}\``);
      console.log("Quoted keys:", quotedKeys);

      const placeholders = `(${keys.map(() => "?").join(", ")})`;
      console.log("Placeholders for a single row:", placeholders);

      const allPlaceholders = rows.map(() => placeholders).join(", ");
      console.log("All placeholders:", allPlaceholders);

      const values: any[] = [];
      for (const row of rows) {
        for (const key of keys) {
          const value = row[key];
          values.push(Array.isArray(value) ? JSON.stringify(value) : value);
        }
      }
      console.log("Values to insert:", values);

      const query = `INSERT INTO \`${table}\` (${quotedKeys.join(
        ", "
      )}) VALUES ${allPlaceholders}`;
      console.log("Final query:", query);

      await db.execute(query, values);
      console.log("Insert operation completed successfully");
    } catch (error) {
      console.error("Error in insert operation:", error);
      throw error;
    }
  }

  static async update(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>
  ) {
    try {
      console.log("Update operation started");
      console.log("Table:", table);
      console.log("Data to update:", data);
      console.log("Where clause:", where);

      if (!where || Object.keys(where).length === 0) {
        throw new Error(
          "The 'where' parameter is required and cannot be empty"
        );
      }

      const keys = Object.keys(data);
      const values = Object.values(data);
      console.log("Keys to update:", keys);
      console.log("Values to update:", values);

      const set = keys.map((k) => `${k} = ?`).join(", ");
      console.log("SET clause:", set);

      const whereKeys = Object.keys(where);
      const whereValues = Object.values(where);
      console.log("Where keys:", whereKeys);
      console.log("Where values:", whereValues);

      const whereClause = whereKeys.map((k) => `${k} = ?`).join(" AND ");
      console.log("WHERE clause:", whereClause);

      const query = `UPDATE ${table} SET ${set} WHERE ${whereClause}`;
      console.log("Final query:", query);

      await db.execute(query, [...values, ...whereValues]);
      console.log("Update operation completed successfully");
    } catch (error) {
      console.error("Error in update operation:", error);
      throw error;
    }
  }

  static async delete(table: string, where: Record<string, any>) {
    try {
      console.log("Delete operation started");
      console.log("Table:", table);
      console.log("Where clause:", where);

      if (!where || Object.keys(where).length === 0) {
        throw new Error(
          "The 'where' parameter is required and cannot be empty"
        );
      }

      const whereKeys = Object.keys(where);
      const whereValues = Object.values(where);
      console.log("Where keys:", whereKeys);
      console.log("Where values:", whereValues);

      const whereClause = whereKeys.map((key) => `${key} = ?`).join(" AND ");
      console.log("WHERE clause:", whereClause);

      const query = `DELETE FROM ${table} WHERE ${whereClause}`;
      console.log("Final query:", query);

      await db.execute(query, whereValues);
      console.log("Delete operation completed successfully");
    } catch (error) {
      console.error("Error in delete operation:", error);
      throw error;
    }
  }

  static async find(table: string, where: Record<string, any>) {
    try {
      console.log("Find operation started");
      console.log("Table:", table);
      console.log("Where clause:", where);

      if (!where || Object.keys(where).length === 0) {
        throw new Error(
          "The 'where' parameter is required and cannot be empty"
        );
      }

      const whereKeys = Object.keys(where);
      const whereValues = Object.values(where);
      console.log("Where keys:", whereKeys);
      console.log("Where values:", whereValues);

      const whereClause = whereKeys.map((key) => `${key} = ?`).join(" AND ");
      console.log("WHERE clause:", whereClause);

      const query = `SELECT * FROM ${table} WHERE ${whereClause}`;
      console.log("Final query:", query);

      const [rows] = await db.execute(query, whereValues);
      console.log("Rows found:", rows);
      return rows;
    } catch (error) {
      console.error("Error in find operation:", error);
      throw error;
    }
  }
}
