export const sqlNewQuestions = [
  // ==========================================
  // EASY QUESTIONS (12 new, IDs 124 to 135)
  // ==========================================
  {
    id: 124,
    title: "How to handle NULL values in SQL using COALESCE?",
    category: "sql",
    difficulty: "easy",
    answer: "NULL indicates a missing or unknown value in a database. Direct comparisons like '= NULL' will fail. The COALESCE function returns the first non-null expression from a list of arguments, making it perfect for setting default values.",
    command: `-- Return 'N/A' if the phone number is NULL\nSELECT employee_id, first_name, COALESCE(phone_number, 'N/A') AS contact_phone\nFROM employees;\n\n-- Retrieve first non-null contact info (mobile, then home, then work)\nSELECT first_name, COALESCE(mobile_phone, home_phone, work_phone, 'No Contact') AS primary_phone\nFROM customers;`
  },
  {
    id: 125,
    title: "Difference between LEFT JOIN, RIGHT JOIN, and INNER JOIN",
    category: "sql",
    difficulty: "easy",
    answer: "• INNER JOIN: Returns rows when there is a match in both tables.\n• LEFT JOIN (or LEFT OUTER JOIN): Returns all rows from the left table, and matched rows from the right table. If no match is found, NULL is returned for right-side columns.\n• RIGHT JOIN (or RIGHT OUTER JOIN): Returns all rows from the right table, and matched rows from the left table. (Generally avoided; prefer LEFT JOIN for consistency).",
    command: `-- INNER JOIN (Only returns employees with departments)\nSELECT e.first_name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;\n\n-- LEFT JOIN (Returns all employees, even those without a department)\nSELECT e.first_name, d.department_name\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.department_id;`
  },
  {
    id: 126,
    title: "How to use GROUP BY with HAVING to filter aggregated results?",
    category: "sql",
    difficulty: "easy",
    answer: "• WHERE: Filters rows *before* aggregation takes place.\n• HAVING: Filters groups *after* aggregation (GROUP BY) takes place.\nYou cannot use aggregate functions (like COUNT, SUM) in a WHERE clause; you must use HAVING.",
    command: `-- Find departments with an average salary greater than $10,000\nSELECT department_id, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department_id\nHAVING AVG(salary) > 10000;`
  },
  {
    id: 127,
    title: "How to retrieve unique rows from a query using DISTINCT?",
    category: "sql",
    difficulty: "easy",
    answer: "The DISTINCT keyword is placed immediately after SELECT to filter out duplicate rows from the result set. It evaluates the combination of all selected columns to determine uniqueness.",
    command: `-- Get a list of all unique departments that have active employees\nSELECT DISTINCT department_id\nFROM employees\nWHERE status = 'ACTIVE';`
  },
  {
    id: 128,
    title: "How to perform wild card searches in SQL using LIKE?",
    category: "sql",
    difficulty: "easy",
    answer: "The LIKE operator filters rows matching string patterns. It uses wildcards:\n• %: Represents zero, one, or multiple characters.\n• _: Represents exactly one character.\nFor case-insensitive searches in some databases, use ILIKE or UPPER/LOWER.",
    command: `# Search for emails ending with '@gmail.com'\nSELECT first_name, email\nFROM users\nWHERE email LIKE '%@gmail.com';\n\n# Search for names where the second letter is 'a'\nSELECT first_name\nFROM users\nWHERE first_name LIKE '_a%';`
  },
  {
    id: 129,
    title: "What is a primary key vs foreign key?",
    category: "sql",
    difficulty: "easy",
    answer: "• Primary Key (PK): A column (or set of columns) that uniquely identifies each row in a table. It cannot contain NULL values and must be unique.\n• Foreign Key (FK): A column in one table that links to the Primary Key of another table. It enforces referential integrity, ensuring you cannot insert orphan records.",
    command: `-- Table definition with PK and FK\nCREATE TABLE departments (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50)\n);\n\nCREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  first_name VARCHAR(50),\n  dept_id INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);`
  },
  {
    id: 130,
    title: "How to update values in a table using UPDATE and WHERE?",
    category: "sql",
    difficulty: "easy",
    answer: "The UPDATE statement modifies existing records. Always include a WHERE clause; omitting the WHERE clause updates *all* rows in the table.",
    command: `-- Update a user's email address by user ID\nUPDATE users\nSET email = 'new_email@company.com'\nWHERE user_id = 104;\n\n-- Give all employees in department 10 a 5% raise\nUPDATE employees\nSET salary = salary * 1.05\nWHERE department_id = 10;`
  },
  {
    id: 131,
    title: "How to safely delete rows from a table using DELETE vs TRUNCATE?",
    category: "sql",
    difficulty: "easy",
    answer: "• DELETE: A DML operation that removes specific rows matching a WHERE clause. It logs each row deletion, supports rollback, and fires triggers. It is slower.\n• TRUNCATE: A DDL operation that removes all rows from a table by deallocating data pages. It is faster, uses minimal log space, cannot be rolled back in some databases, and does not fire triggers.",
    command: `-- Delete specific rows (can be rolled back)\nDELETE FROM activity_logs\nWHERE log_date < '2025-01-01';\n\n-- Truncate entire table (fast, deallocates pages)\nTRUNCATE TABLE temp_staging_data;`
  },
  {
    id: 132,
    title: "How do you count rows in a table using COUNT(*) vs COUNT(column)?",
    category: "sql",
    difficulty: "easy",
    answer: "• COUNT(*): Counts the total number of rows in the query result, including rows with NULL values.\n• COUNT(column): Counts only rows where the specified column contains a non-null value.",
    command: `-- Total rows (e.g. 100 rows)\nSELECT COUNT(*) FROM employees;\n\n-- Non-null phone numbers (e.g. 85 rows if 15 are NULL)\nSELECT COUNT(phone_number) FROM employees;`
  },
  {
    id: 133,
    title: "How to limit query results and implement pagination in SQL?",
    category: "sql",
    difficulty: "easy",
    answer: "To return a subset of rows (e.g., for paginated pages), use LIMIT and OFFSET (PostgreSQL, MySQL) or FETCH NEXT ROWS (Oracle, SQL Server).",
    command: `-- MySQL/PostgreSQL: Get the first 10 rows\nSELECT id, title FROM questions LIMIT 10;\n\n-- Get rows 11 to 20 (page 2)\nSELECT id, title FROM questions LIMIT 10 OFFSET 10;\n\n-- Oracle standard syntax:\n-- SELECT id, title FROM questions FETCH FIRST 10 ROWS ONLY;`
  },
  {
    id: 134,
    title: "How to use CASE WHEN statements for conditional logic in SQL?",
    category: "sql",
    difficulty: "easy",
    answer: "The CASE expression provides conditional logic (if-then-else) inline in SQL queries. It evaluates conditions and returns a value when a match is found.",
    command: `-- Label salaries as High, Medium, or Low\nSELECT first_name, salary,\n       CASE \n         WHEN salary >= 10000 THEN 'High'\n         WHEN salary >= 5000 THEN 'Medium'\n         ELSE 'Low'\n       END AS salary_bracket\nFROM employees;`
  },
  {
    id: 135,
    title: "What is the difference between WHERE and HAVING?",
    category: "sql",
    difficulty: "easy",
    answer: "• WHERE: Filters records *before* any groupings are created. It cannot reference aggregate functions.\n• HAVING: Filters records *after* GROUP BY groupings are formed. It must reference aggregated values.",
    command: `-- Filtering rows before grouping (WHERE)\nSELECT job_id, COUNT(*) \nFROM employees \nWHERE salary > 5000 \nGROUP BY job_id;\n\n-- Filtering groups after aggregation (HAVING)\nSELECT job_id, COUNT(*)\nFROM employees\nGROUP BY job_id\nHAVING COUNT(*) > 5;`
  },

  // ==========================================
  // MEDIUM QUESTIONS (14 new, IDs 136 to 149)
  // ==========================================
  {
    id: 136,
    title: "Explain SQL Window Functions: ROW_NUMBER, RANK, and DENSE_RANK",
    category: "sql",
    difficulty: "medium",
    answer: "Window functions perform calculations across a set of table rows related to the current row, without collapsing them into a single row (unlike GROUP BY).\n\nKey Differences:\n• ROW_NUMBER(): Assigns a unique sequential integer to each row. In case of ties, it assigns numbers arbitrarily.\n• RANK(): Assigns rank with gaps. If two rows tie for 1st, they both get 1, and the next row gets 3.\n• DENSE_RANK(): Assigns rank without gaps. If two rows tie for 1st, they both get 1, and the next row gets 2.",
    command: `-- Calculate rank of employee salaries within each department\nSELECT department_id, first_name, salary,\n       ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS row_num,\n       RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk,\n       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dense_rnk\nFROM employees;`
  },
  {
    id: 137,
    title: "Using LEAD and LAG to calculate differences between consecutive rows",
    category: "sql",
    difficulty: "medium",
    answer: "LEAD and LAG are window functions that allow accessing data from other rows relative to the current row without using a self-join:\n• LAG(column, offset): Returns the column value from 'offset' rows prior.\n• LEAD(column, offset): Returns the column value from 'offset' rows ahead.\n\nThis is useful for calculating period-over-period growth or time-series changes.",
    command: `-- Compare monthly sales with the previous month's sales\nSELECT sales_month, total_revenue,\n       LAG(total_revenue, 1) OVER (ORDER BY sales_month) AS prev_month_revenue,\n       total_revenue - LAG(total_revenue, 1) OVER (ORDER BY sales_month) AS monthly_revenue_change\nFROM monthly_sales;`
  },
  {
    id: 138,
    title: "What is database normalization? Explain 1NF, 2NF, and 3NF",
    category: "sql",
    difficulty: "medium",
    answer: "Normalization organizes table structures to minimize data redundancy and prevent insertion, update, and deletion anomalies.\n\nNormalization stages:\n• 1st Normal Form (1NF): Column values must be atomic (no arrays/comma-separated lists) and rows must be unique.\n• 2nd Normal Form (2NF): Must be in 1NF, and all non-key columns must depend completely on the primary key (no partial dependencies on composite keys).\n• 3rd Normal Form (3NF): Must be in 2NF, and non-key columns must not depend on other non-key columns (no transitive dependencies).",
    command: `-- Example of converting 2NF to 3NF:\n-- Violates 3NF: (emp_id [PK] -> dept_id -> dept_name)\n-- Fix: Split into two tables:\nCREATE TABLE depts (\n  dept_id INT PRIMARY KEY,\n  dept_name VARCHAR(50)\n);\n\nCREATE TABLE emps (\n  emp_id INT PRIMARY KEY,\n  first_name VARCHAR(50),\n  dept_id INT REFERENCES depts(dept_id)\n);`
  },
  {
    id: 139,
    title: "Explain CTEs (Common Table Expressions) and their benefits over nested subqueries",
    category: "sql",
    difficulty: "medium",
    answer: "A Common Table Expression (CTE) is a temporary result set defined using a 'WITH' clause. It improves readability, modularizes complex query blocks, and can be referenced multiple times within a single query.",
    command: `-- Modular query using CTE\nWITH dept_costs AS (\n  SELECT department_id, SUM(salary) AS total_dept_salary\n  FROM employees\n  GROUP BY department_id\n),\ncompany_avg AS (\n  SELECT AVG(total_dept_salary) AS avg_dept_salary\n  FROM dept_costs\n)\nSELECT d.department_id, d.total_dept_salary\nFROM dept_costs d, company_avg c\nWHERE d.total_dept_salary > c.avg_dept_salary;`
  },
  {
    id: 140,
    title: "How do you identify and kill blocking queries in PostgreSQL?",
    category: "sql",
    difficulty: "medium",
    answer: "Locks prevent concurrent data updates from clashing. However, uncommitted transactions or heavy queries can hold locks indefinitely, blocking other operations.\n\nResolution:\n1. Query the 'pg_stat_activity' catalog view to identify blocking and blocked queries.\n2. Terminate the blocking backend process using pg_terminate_backend.",
    command: `-- Find queries waiting for locks and the blockers holding them\nSELECT blocked_locks.pid     AS blocked_pid,\n       blocked_activity.query  AS blocked_statement,\n       blocking_locks.pid    AS blocking_pid,\n       blocking_activity.query AS blocking_statement\nFROM  pg_catalog.pg_locks         blocked_locks\nJOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid\nJOIN pg_catalog.pg_locks         blocking_locks \n  ON blocking_locks.locktype = blocked_locks.locktype\n  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database\n  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation\n  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page\n  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple\n  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid\n  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid\n  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid\n  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid\n  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid\n  AND blocking_locks.pid != blocked_locks.pid\nJOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid\nWHERE NOT blocked_locks.granted;\n\n-- Terminate blocking process PID gracefully\nSELECT pg_cancel_backend(blocking_pid);\n\n-- Forcefully terminate process PID\nSELECT pg_terminate_backend(blocking_pid);`
  },
  {
    id: 141,
    title: "What are ACID properties in database transactions?",
    category: "sql",
    difficulty: "medium",
    answer: "ACID defines the key properties required to guarantee database transaction reliability:\n• Atomicity: Entire transaction completes successfully, or all changes are rolled back (All-or-Nothing).\n• Consistency: Database transitions from one valid state to another, maintaining all constraints, triggers, and schemas.\n• Isolation: Transactions running concurrently execute independently without interfering with each other.\n• Durability: Once a transaction commits, its modifications are permanently recorded in non-volatile memory (surviving system crashes).",
    command: `-- Example of ensuring Atomicity using Transaction Block\nBEGIN TRANSACTION;\n  UPDATE bank_accounts SET balance = balance - 500 WHERE account_id = 10;\n  UPDATE bank_accounts SET balance = balance + 500 WHERE account_id = 11;\nCOMMIT; -- If either statement fails, execute ROLLBACK;`
  },
  {
    id: 142,
    title: "Difference between clustered index, non-clustered index, and covering index",
    category: "sql",
    difficulty: "medium",
    answer: "• Clustered Index: Sorts and stores the physical data rows of the table based on key values. A table can have only one clustered index.\n• Non-Clustered Index: Maintains a separate structure containing key values and pointers (ROWIDs or primary keys) back to the actual data rows.\n• Covering Index: A non-clustered index that includes/covers *all* columns requested by a SELECT query. Since the index holds all requested data, the query planner can return results directly from the index tree, skipping the expensive table lookup step (index-only scan).",
    command: `-- Create covering index (index includes filter and select columns)\nCREATE INDEX idx_emp_dept_salary ON employees(department_id, salary, employee_id);\n\n-- This query performs an index-only scan (no table blocks accessed)\nSELECT department_id, employee_id\nFROM employees\nWHERE department_id = 20;`
  },
  {
    id: 143,
    title: "How to use Self-Joins to compare rows within the same table?",
    category: "sql",
    difficulty: "medium",
    answer: "A self-join is a standard join that links a table to itself. This requires assigning distinct aliases to the table in the FROM clause. It is used to query hierarchical data (e.g. employee-manager links) or compare records in the same table.",
    command: `-- Find employees and their managers from a single employees table\nSELECT e.first_name AS employee,\n       m.first_name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.employee_id;`
  },
  {
    id: 144,
    title: "How do you implement Upsert operations (INSERT ON CONFLICT/MERGE)?",
    category: "sql",
    difficulty: "medium",
    answer: "An 'Upsert' operation inserts a new row, or updates the existing row if it violates a uniqueness constraint (like a Primary Key duplicate).\n• PostgreSQL: INSERT ON CONFLICT DO UPDATE\n• MySQL: INSERT ... ON DUPLICATE KEY UPDATE\n• SQL Standard / Oracle: MERGE",
    command: `-- PostgreSQL Upsert (inserts new user, updates active timestamp on duplicate)\nINSERT INTO user_sessions (user_id, token, last_active)\nVALUES (105, 'xyz123', NOW())\nON CONFLICT (user_id)\nDO UPDATE SET last_active = EXCLUDED.last_active, token = EXCLUDED.token;\n\n-- MySQL Upsert\nINSERT INTO user_sessions (user_id, token, last_active)\nVALUES (105, 'xyz123', NOW())\nON DUPLICATE KEY UPDATE token = VALUES(token), last_active = VALUES(last_active);`
  },
  {
    id: 145,
    title: "Explain the difference between correlated and uncorrelated subqueries",
    category: "sql",
    difficulty: "medium",
    answer: "• Uncorrelated Subquery: Executes independently of the outer query. It runs once, returns a result set, and the outer query uses that result.\n• Correlated Subquery: References columns from the outer query. It must execute repeatedly, once for every candidate row evaluated by the outer query. These are typically slower and should be replaced with JOINs or CTEs where possible.",
    command: `-- Uncorrelated: Subquery runs once\nSELECT first_name, salary \nFROM employees \nWHERE salary > (SELECT AVG(salary) FROM employees);\n\n-- Correlated: Subquery runs once for EVERY employee row to check their department average\nSELECT e1.first_name, e1.salary, e1.department_id\nFROM employees e1\nWHERE e1.salary > (\n  SELECT AVG(e2.salary) \n  FROM employees e2 \n  WHERE e2.department_id = e1.department_id\n);`
  },
  {
    id: 146,
    title: "What are Foreign Key constraints and cascading actions?",
    category: "sql",
    difficulty: "medium",
    answer: "Foreign Keys enforce referential integrity between tables. When a referenced parent row is updated or deleted, you can configure cascading actions to define what happens to child rows:\n• ON DELETE CASCADE: Deletes child rows automatically when the parent row is deleted.\n• ON DELETE SET NULL: Sets child foreign key columns to NULL.\n• ON DELETE RESTRICT / NO ACTION: Blocks the deletion of the parent row if child references exist (Default behavior).",
    command: `-- Create foreign key with cascade delete rule\nCREATE TABLE order_items (\n  item_id INT PRIMARY KEY,\n  order_id INT,\n  product_id INT,\n  quantity INT,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE\n);`
  },
  {
    id: 147,
    title: "Using COALESCE to implement conditional queries dynamically",
    category: "sql",
    difficulty: "medium",
    answer: "COALESCE is useful for writing dynamic search filters in stored procedures or APIs. By passing optional search parameters alongside column checks, you can filter records dynamically without building dynamic SQL queries.",
    command: `-- Dynamic search where parameters can be NULL (if NULL, column matches itself)\nSELECT employee_id, first_name, job_id, department_id\nFROM employees\nWHERE department_id = COALESCE(:dept_param, department_id)\n  AND job_id = COALESCE(:job_param, job_id);`
  },
  {
    id: 148,
    title: "Difference between char, varchar, and text datatypes in databases",
    category: "sql",
    difficulty: "medium",
    answer: "• CHAR(N): Fixed-length string. If you insert a string shorter than N, the database pads it with trailing spaces. Best for fixed-length codes (ISO country codes, status chars).\n• VARCHAR(N): Variable-length string up to N characters. Stores exactly the length of the string plus a 1-2 byte length prefix. Best for names, addresses, and variable strings.\n• TEXT / CLOB: Unlimited length string (or up to 2-4GB). Typically stored off-row (outside the table's main data page) with pointers, resulting in slightly slower access times but supporting massive text payloads.",
    command: `-- Table definition using optimal character structures\nCREATE TABLE product_catalogue (\n  product_iso_code CHAR(3) PRIMARY KEY, -- e.g. 'USA', 'CAN'\n  product_name VARCHAR(100) NOT NULL,\n  product_description TEXT\n);`
  },
  {
    id: 149,
    title: "How to use NULLIF in SQL to avoid divide-by-zero errors?",
    category: "sql",
    difficulty: "medium",
    answer: "Dividing by zero causes runtime query crashes. The NULLIF(value1, value2) function compares two expressions. If they are equal, it returns NULL. Since dividing a number by NULL results in NULL instead of a crash, you can wrap divisor columns in NULLIF.",
    command: `-- Safely calculate percentage margin without crash risks if units_sold is 0\nSELECT product_id,\n       total_revenue / NULLIF(units_sold, 0) AS average_price_per_unit\nFROM sales_reports;`
  },

  // ==========================================
  // HARD QUESTIONS (17 new, IDs 150 to 166)
  // ==========================================
  {
    id: 150,
    title: "Analyzing execution plans using EXPLAIN ANALYZE for optimization",
    category: "sql",
    difficulty: "hard",
    answer: "Optimizing slow queries requires analyzing execution plans. Using 'EXPLAIN' displays the execution path estimated by the optimizer, while 'EXPLAIN ANALYZE' (or 'EXPLAIN (ANALYZE, BUFFERS)' in PostgreSQL) actually executes the query, outputting real-time timings and I/O buffer hits.\n\nKey plan metrics:\n• Seq Scan vs Index Scan: Sequential scans read entire tables; check if indexes should be added.\n• Nested Loops vs Hash Joins: Hash joins are preferred for large datasets.\n• Actual rows vs Estimated rows: A mismatch indicates stale statistics; update them with ANALYZE.\n• Shared hit/read: Buffer blocks read from RAM cache (hit) vs disk (read).",
    command: `-- Explain query execution details in PostgreSQL\nEXPLAIN (ANALYZE, BUFFERS, VERBOSE)\nSELECT u.username, count(o.order_id)\nFROM users u\nJOIN orders o ON u.user_id = o.user_id\nWHERE u.registration_date > '2025-01-01'\nGROUP BY u.username;`
  },
  {
    id: 151,
    title: "SQL Transaction Isolation Levels and Concurrency Anomalies",
    category: "sql",
    difficulty: "hard",
    answer: "SQL-92 defines four transaction isolation levels to balance concurrency against data consistency anomalies. Higher isolation levels increase lock overhead and reduce transaction throughput.\n\nConcurrency Anomalies:\n1. Dirty Read: Transaction A reads uncommitted modifications made by Transaction B.\n2. Non-Repeatable Read: Transaction A reads a row, Transaction B updates that row and commits, and Transaction A re-reads the row to find different values.\n3. Phantom Read: Transaction A queries a range of rows, Transaction B inserts new rows in that range and commits, and Transaction A re-runs the query to find new rows.\n\nIsolation Levels:\n• Read Uncommitted: Allows all anomalies.\n• Read Committed: Prevents Dirty Reads (Default in Postgres, Oracle, SQL Server).\n• Repeatable Read: Prevents Dirty and Non-Repeatable Reads.\n• Serializable: Prevents all anomalies using lock-graphs or Optimistic Concurrency Control.",
    command: `-- Set transaction isolation level dynamically in a session\nSET TRANSACTION ISOLATION LEVEL SERIALIZABLE;\n\n-- Example of starting transaction\nBEGIN;\n  SELECT balance FROM accounts WHERE id = 1;\nCOMMIT;`
  },
  {
    id: 152,
    title: "Writing Recursive CTEs to query hierarchical tree structures",
    category: "sql",
    difficulty: "hard",
    answer: "Recursive CTEs reference themselves to query hierarchical data structures (e.g. organizational hierarchies, bill-of-materials, network routings).\n\nStructure:\n1. Anchor Member: An initial query that serves as the baseline for recursion.\n2. UNION or UNION ALL: Combines the anchor results with the recursive results.\n3. Recursive Member: A query referencing the CTE name, joining it with the source table to traverse the hierarchy.",
    command: `-- Query organizational structure recursively, calculating hierarchy level\nWITH RECURSIVE org_chart AS (\n  -- Anchor Member: Root CEO\n  SELECT employee_id, first_name, manager_id, 1 AS depth\n  FROM employees\n  WHERE manager_id IS NULL\n\n  UNION ALL\n\n  -- Recursive Member: Join CTE with employees to find direct reports\n  SELECT e.employee_id, e.first_name, e.manager_id, o.depth + 1\n  FROM employees e\n  JOIN org_chart o ON e.manager_id = o.employee_id\n)\nSELECT employee_id, first_name, manager_id, depth\nFROM org_chart\nORDER BY depth, employee_id;`
  },
  {
    id: 153,
    title: "Tuning Composite Indexes and the Leftmost Prefix Rule",
    category: "sql",
    difficulty: "hard",
    answer: "A composite index contains multiple columns (e.g. INDEX(col_a, col_b, col_c)). Designing these indexes requires understanding the leftmost prefix rule.\n\nRules:\n• The query planner can use the index if the query filters on columns from left to right (e.g. WHERE col_a = 5 or WHERE col_a = 5 AND col_b = 6).\n• If the query filters on col_b or col_c without filtering on col_a, the index cannot be traversed efficiently (leading to index scans or index skips).\n• Column ordering rule: Put highly selective columns (equality filters) first, followed by range filter columns.",
    command: `-- Create composite index\nCREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date, status);\n\n-- Uses index efficiently (Leftmost col matches)\nSELECT * FROM orders WHERE customer_id = 1045 AND order_date > '2026-01-01';\n\n-- Cannot use index effectively (Missing leftmost customer_id filter)\nSELECT * FROM orders WHERE order_date > '2026-01-01' AND status = 'COMPLETED';`
  },
  {
    id: 154,
    title: "Materialized Views vs Standard Views: Performance and Sync Mechanics",
    category: "sql",
    difficulty: "hard",
    answer: "• Standard View: A virtual table containing a saved SQL query. When queried, it executes the underlying query on the fly. It consumes no storage but incurs CPU overhead for complex joins.\n• Materialized View: A physical table that pre-calculates and stores the query results. Queries are extremely fast because they read pre-computed data from disk. However, the data can become stale, requiring manual or automated refreshes.\n\nRefresh methods:\n• REFRESH MATERIALIZED VIEW (Full): Locks and recalculates the entire view.\n• CONCURRENTLY: Refreshes the view using diff logs without locking read access (Requires a unique index on the materialized view).",
    command: `-- Create materialized view for heavy analytical query\nCREATE MATERIALIZED VIEW sales_summary_mv AS\nSELECT product_id, COUNT(*) AS sales_count, SUM(amount) AS total_revenue\nFROM sales\nGROUP BY product_id;\n\n-- Create unique index required for concurrent refreshes\nCREATE UNIQUE INDEX idx_sales_summary_prod ON sales_summary_mv(product_id);\n\n-- Refresh materialized view concurrently in background\nREFRESH MATERIALIZED VIEW CONCURRENTLY sales_summary_mv;`
  },
  {
    id: 155,
    title: "Table Partitioning Strategies: Range, List, and Hash Partitioning",
    category: "sql",
    difficulty: "hard",
    answer: "Partitioning splits a massive table (e.g., 500GB+) into smaller physical segments (partitions) based on a partition key. This improves performance via partition pruning (the query planner ignores partitions that don't match the query filter) and simplifies maintenance.\n\nPartitioning types:\n• Range Partitioning: Segments data by value ranges (e.g., date ranges like monthly or yearly).\n• List Partitioning: Segments data based on an explicit list of values (e.g., country codes or regions).\n• Hash Partitioning: Distributes data across a fixed number of partitions using a hash function on the partition key. Best for balancing write I/O.",
    command: `-- Create parent partitioned table in PostgreSQL (Range partitioning by date)\nCREATE TABLE audit_logs (\n  log_id INT,\n  log_date DATE NOT NULL,\n  message TEXT\n) PARTITION BY RANGE (log_date);\n\n-- Create child partitions\nCREATE TABLE audit_logs_y2025 PARTITION OF audit_logs\n  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');\n\nCREATE TABLE audit_logs_y2026 PARTITION OF audit_logs\n  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');`
  },
  {
    id: 156,
    title: "Avoiding deadlocks in high-throughput SQL databases",
    category: "sql",
    difficulty: "hard",
    answer: "Deadlocks occur when two transactions hold locks on different resources, and each attempts to acquire a lock on the resource held by the other. The engine aborts one of the transactions to break the cycle.\n\nPrevention Strategies:\n• Acquire locks in a consistent order across all application transactions (e.g., always update 'users' before 'orders').\n• Keep transactions small and short. Avoid calling external HTTP APIs or performing user interactions inside transaction blocks.\n• Use SELECT ... FOR UPDATE with NOWAIT or SKIP LOCKED to fail fast or skip locked rows instead of waiting.",
    command: `-- Acquire lock, fail immediately if row is locked by another transaction\nSELECT balance FROM accounts\nWHERE id = 10\nFOR UPDATE NOWAIT;\n\n-- Queue processing: Skip locked rows to avoid blocking concurrent workers\nSELECT task_id, payload\nFROM task_queue\nWHERE status = 'PENDING'\nLIMIT 5\nFOR UPDATE SKIP LOCKED;`
  },
  {
    id: 157,
    title: "Pivoting and Unpivoting Data dynamically in SQL",
    category: "sql",
    difficulty: "hard",
    answer: "• Pivoting: Converts rows into columns, typically aggregating values for reporting dashboards.\n• Unpivoting: Converts columns back into rows, restructuring denormalized tables into a normalized format.\nIn databases lacking native PIVOT syntax, you can pivot data using conditional aggregation (CASE WHEN + SUM/MAX).",
    command: `-- Pivoting quarterly sales rows into distinct columns using CASE WHEN\nSELECT product_id,\n       SUM(CASE WHEN quarter = 'Q1' THEN sales_amount ELSE 0 END) AS Q1_sales,\n       SUM(CASE WHEN quarter = 'Q2' THEN sales_amount ELSE 0 END) AS Q2_sales,\n       SUM(CASE WHEN quarter = 'Q3' THEN sales_amount ELSE 0 END) AS Q3_sales,\n       SUM(CASE WHEN quarter = 'Q4' THEN sales_amount ELSE 0 END) AS Q4_sales\nFROM quarterly_sales\nGROUP BY product_id;`
  },
  {
    id: 158,
    title: "Explain index selectivity and B-Tree traversal mechanics",
    category: "sql",
    difficulty: "hard",
    answer: "Index selectivity represents the ratio of unique values in a column to the total row count. A column with high selectivity (e.g. primary key, UUID) is an excellent candidate for B-Tree indexing because traversing the index tree quickly isolates a single row.\n\nB-Tree Mechanics:\n• A B-Tree index has root, branch, and leaf nodes.\n• Leaf nodes contain key values and pointers (ROWIDs) to data blocks, linked as a doubly-linked list for fast range scans.\n• If a column has low selectivity (e.g., boolean status flags), the optimizer will bypass the index and perform a full table scan, as the cost of reading index blocks plus random table reads exceeds the cost of a sequential scan.",
    command: `-- Query index selectivity from database stats\nSELECT relname, n_distinct, description\nFROM pg_stat_user_tables;\n\n-- Create index on highly selective column\nCREATE INDEX idx_users_uuid ON users(uuid_string);`
  },
  {
    id: 159,
    title: "Optimizing database lock contention under write-heavy workloads",
    category: "sql",
    difficulty: "hard",
    answer: "Under write-heavy workloads, lock queues build up, causing connection timeouts.\n\nOptimization:\n• Use Multi-Version Concurrency Control (MVCC) so reads do not block writes, and writes do not block reads.\n• Avoid locking whole tables. Use fine-grained row-level locks.\n• Batch bulk inserts to minimize transaction overhead, but keep batch sizes small enough (~1000-5000 rows) to avoid lock escalations.\n• Use index-organized tables or partitioned indexes to distribute write I/O.",
    command: `-- Check lock types and waiting sessions in SQL Server/Postgres\nSELECT pid, mode, locktype, granted \nFROM pg_locks \nWHERE NOT granted;`
  },
  {
    id: 160,
    title: "Designing database triggers to audit data changes securely",
    category: "sql",
    difficulty: "hard",
    answer: "Triggers execute automatically in response to DML operations (INSERT, UPDATE, DELETE). They are commonly used to enforce security policies or audit data changes.\n\nBest Practices:\n• Keep triggers extremely fast; they run inside the client's transaction context and block completion.\n• Avoid calling external network APIs or heavy queries inside triggers.\n• Handle NULLs and conditional operations properly using OLD and NEW aliases.",
    command: `-- Create audit table\nCREATE TABLE audit_trail (\n  audit_id SERIAL PRIMARY KEY,\n  table_name VARCHAR(50),\n  action VARCHAR(10),\n  record_id INT,\n  changed_by VARCHAR(50),\n  changed_at TIMESTAMP DEFAULT NOW()\n);\n\n-- Create audit trigger function in PostgreSQL\nCREATE OR REPLACE FUNCTION audit_trigger_func()\nRETURNS TRIGGER AS $$\nBEGIN\n  INSERT INTO audit_trail(table_name, action, record_id, changed_by)\n  VALUES (TG_TABLE_NAME, TG_OP, COALESCE(NEW.id, OLD.id), current_user);\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Bind trigger to employees table\nCREATE TRIGGER emp_audit_trigger\nAFTER UPDATE OR DELETE ON employees\nFOR EACH ROW EXECUTE FUNCTION audit_trigger_func();`
  },
  {
    id: 161,
    title: "Difference between logical replication and physical replication in PostgreSQL",
    category: "sql",
    difficulty: "hard",
    answer: "• Physical Replication: Copies the raw byte-for-byte data blocks of the database (WAL files). The standby database is an exact replica of the primary and must run the same major version. It replicates the entire instance, and the standby can only be open in read-only mode.\n• Logical Replication: Replicates SQL statements/data changes based on a publication/subscription model. It allows replicating specific tables rather than the entire instance. It supports cross-major-version replication (useful for zero-downtime upgrades) and allows the subscriber database to be open in read-write mode.",
    command: `-- On Primary: Create publication for specific tables\nCREATE PUBLICATION app_publication FOR TABLE users, orders;\n\n-- On Subscriber: Create subscription pointing to primary\nCREATE SUBSCRIPTION app_subscription \nCONNECTION 'host=primary_db port=5432 dbname=prod_db user=repl_user password=secret'\nPUBLICATION app_publication;`
  },
  {
    id: 162,
    title: "Optimizing SQL query cost using Optimizer Hints",
    category: "sql",
    difficulty: "hard",
    answer: "The query optimizer determines the execution plan for a query. While it usually makes the correct choice, stale statistics or complex query structures can lead to sub-optimal plans. In these cases, you can use optimizer hints to force a specific execution path.\n\nCaution: Hints should be used as a last resort in production. They can break if schemas or database versions change. Always prioritize gathering fresh statistics first.\n• Oracle/MySQL: Uses inline comments (e.g. /*+ INDEX(e idx_emp_sal) */).\n• PostgreSQL: PostgreSQL does not support hints natively; use parameters (like 'SET enable_seqscan = off') or pg_hint_plan.",
    command: `-- Force Oracle to use a specific index\nSELECT /*+ INDEX(e idx_emp_salary) */ first_name, salary\nFROM employees e\nWHERE salary > 80000;\n\n-- Force Oracle to use a Hash Join\nSELECT /*+ USE_HASH(e d) */ e.first_name, d.department_name\nFROM employees e\nJOIN departments d ON e.department_id = d.department_id;`
  },
  {
    id: 163,
    title: "Troubleshooting database connection pools and max connection limits",
    category: "sql",
    difficulty: "hard",
    answer: "When client applications attempt to open more connections than the database allows, the database rejects new connections with errors like 'Too many connections' or 'Fatal: remaining connection slots are reserved'.\n\nResolution:\n• Set up a connection pooler (e.g. PgBouncer for PostgreSQL) to multiplex client connections.\n• Tune maximum connection parameters on the database server.\n• Optimize client pool settings to reuse active connections and prevent leaks.",
    command: `-- View current active connection counts by database in PostgreSQL\nSELECT datname, numbackends FROM pg_stat_database;\n\n-- View max connections setting\nSHOW max_connections;\n\n-- Adjust max connections (requires restart)\n-- ALTER SYSTEM SET max_connections = 500;`
  },
  {
    id: 164,
    title: "Handling character set conversion and collation conflicts in queries",
    category: "sql",
    difficulty: "hard",
    answer: "Joining tables with different character sets or collations (e.g., comparing latin1 vs utf8 strings) leads to collation mismatch errors.\n\nResolution:\n• Convert column collations during the join using the COLLATE clause.\n• Standardize database character sets to UTF-8.",
    command: `-- Resolve collation mismatch in SQL Server\nSELECT e.name, h.history_log\nFROM employees e\nJOIN employee_history h ON e.name = h.name COLLATE Latin1_General_CS_AS;\n\n-- Collation conversion in PostgreSQL\nSELECT * FROM products \nWHERE name COLLATE "C" = 'Sample';`
  },
  {
    id: 165,
    title: "Tuning query execution speed with covering index structures",
    category: "sql",
    difficulty: "hard",
    answer: "A covering index contains all columns referenced by a query (including columns in SELECT, JOIN, and WHERE clauses). When a covering index is available, the database can return query results directly from the index tree, skipping the table lookup step.\n\nOptimization:\n• Use the INCLUDE clause (PostgreSQL, SQL Server) to append non-key columns to an index. This keeps the index tree clean while providing covering benefits.",
    command: `-- Create index with included columns in PostgreSQL\nCREATE INDEX idx_orders_customer_include\nON orders(customer_id)\nINCLUDE (order_date, total_amount);\n\n-- This query performs an index-only scan, reading data directly from the index blocks\nSELECT order_date, total_amount\nFROM orders\nWHERE customer_id = 4580;`
  },
  {
    id: 166,
    title: "Optimizing bulk data imports using copy commands and staging tables",
    category: "sql",
    difficulty: "hard",
    answer: "Running millions of standard INSERT statements is slow because each insert incurs transactional overhead, index updates, and log writes.\n\nBulk import strategies:\n• Use the COPY command (or BULK INSERT) to stream raw files directly into a staging table.\n• Drop indexes and foreign key constraints on the staging table before importing, and recreate them afterward.\n• Perform data validation and transformations in the staging table before merging it into target production tables.",
    command: `-- PostgreSQL COPY command to stream a CSV file directly into a staging table\nCOPY staging_sales(product_id, units_sold, price, sale_date)\nFROM '/var/lib/postgresql/data/sales_data.csv'\nDELIMITER ',' CSV HEADER;\n\n-- Merge staging data into production table using MERGE or INSERT ON CONFLICT`
  }
];
