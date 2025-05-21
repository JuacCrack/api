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
      const columnQuery = `
      SELECT 
        C.COLUMN_NAME,
        C.DATA_TYPE,
        C.COLUMN_KEY,
        K.REFERENCED_TABLE_NAME,
        K.REFERENCED_COLUMN_NAME
      FROM information_schema.COLUMNS AS C
      LEFT JOIN information_schema.KEY_COLUMN_USAGE AS K
        ON C.TABLE_NAME = K.TABLE_NAME
        AND C.COLUMN_NAME = K.COLUMN_NAME
        AND C.TABLE_SCHEMA = K.TABLE_SCHEMA
      WHERE C.TABLE_SCHEMA = DATABASE() AND C.TABLE_NAME = ?
      ORDER BY C.ORDINAL_POSITION
    `;

      const [columns] = (await db.execute(columnQuery, [table])) as [
        Array<any>,
        any
      ];

      const structure = [];

      for (const col of columns) {
        const isFK = !!col.REFERENCED_TABLE_NAME;
        const fkData = isFK
          ? await this.getForeignKeyDetails(
              col.REFERENCED_TABLE_NAME,
              col.REFERENCED_COLUMN_NAME
            )
          : null;

        structure.push({
          columnName: col.COLUMN_NAME,
          dataType: col.DATA_TYPE,
          isPrimaryKey: col.COLUMN_KEY === "PRI",
          isForeignKey: isFK,
          foreignKey: fkData,
        });
      }

      return structure;
    } catch (error) {
      console.error("Error in structure operation:", error);
      throw error;
    }
  }

  private static async getForeignKeyDetails(
    refTable: string,
    refColumn: string,
    pkValue?: string | number
  ) {
    const refColsQuery = `
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION
    LIMIT 2
  `;

    const [refCols] = (await db.execute(refColsQuery, [refTable])) as [
      Array<any>,
      any
    ];
    if (refCols.length < 2) return null;

    const [pkCol, secondCol] = refCols.map((r) => r.COLUMN_NAME);

    let rowsQuery: string;
    let rowsParams: Array<string | number>;

    if (typeof pkValue !== "undefined" && pkValue !== null) {
      rowsQuery = `SELECT \`${pkCol}\` AS pk, \`${secondCol}\` AS col2 FROM \`${refTable}\` WHERE \`${pkCol}\` = ? LIMIT 1`;
      rowsParams = [pkValue];
    } else {
      rowsQuery = `SELECT \`${pkCol}\` AS pk, \`${secondCol}\` AS col2 FROM \`${refTable}\``;
      rowsParams = [];
    }

    const [fkRows] = (await db.execute(rowsQuery, rowsParams)) as [
      Array<any>,
      any
    ];

    return {
      referencedTable: refTable,
      referencedColumn: refColumn,
      rows: fkRows,
    };
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
