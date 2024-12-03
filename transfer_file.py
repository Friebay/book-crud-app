import sqlite3

# File paths
source_db_path = r"C:\Users\zabit\Documents\GitHub\book-crud-app\books.sqlite"
destination_db_path = r"C:\Users\zabit\Documents\GitHub\book-crud-app\database.sqlite"

# Transfer data
try:
    # Connect to source and destination databases
    source_conn = sqlite3.connect(source_db_path)
    dest_conn = sqlite3.connect(destination_db_path)

    # Cursor objects
    source_cursor = source_conn.cursor()
    dest_cursor = dest_conn.cursor()

    # Read data from the source table
    source_cursor.execute("SELECT * FROM collected_books")
    rows = source_cursor.fetchall()

    # Insert data into the destination table
    if rows:
        # Get the number of columns in the source table
        num_columns = len(rows[0])
        placeholders = ", ".join(["?"] * num_columns)
        dest_cursor.executemany(
            f"INSERT INTO collected_books VALUES ({placeholders})",
            rows
        )
        dest_conn.commit()
        print(f"Successfully transferred {len(rows)} rows to the destination database.")
    else:
        print("No data found in the source table.")

except sqlite3.Error as e:
    print(f"SQLite error: {e}")
finally:
    # Close the connections
    source_cursor.close()
    source_conn.close()
    dest_cursor.close()
    dest_conn.close()
