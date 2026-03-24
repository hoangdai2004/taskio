import { db } from "../config/db.js";

export const getDashboard = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;

    // ===== STATS =====
    const [stats] = await db.query(
      `
      SELECT
        COUNT(t.id) AS total,

        COALESCE(SUM(CASE WHEN c.name = 'Todo' THEN 1 END),0) AS todo,
        COALESCE(SUM(CASE WHEN c.name = 'In Progress' THEN 1 END),0) AS inProgress,
        COALESCE(SUM(CASE WHEN c.name = 'Done' THEN 1 END),0) AS completed,

        COALESCE(SUM(
          CASE
            WHEN t.due_date IS NOT NULL
            AND t.due_date < NOW()
            AND c.name != 'Done'
            THEN 1
          END
        ),0) AS overdue

      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      JOIN projects p ON p.id = c.project_id
      WHERE p.workspace_id = ?
      `,
      [workspaceId]
    );

    const stat = stats[0];

    // ===== CHART =====
    const chart = [
      { label: "Completed", value: stat.completed, color: "#10b981" },
      { label: "In Progress", value: stat.inProgress, color: "#0ea5e9" },
      { label: "Todo", value: stat.todo, color: "#f59e0b" },
      { label: "Overdue", value: stat.overdue, color: "#ef4444" },
    ];

    // ===== UPCOMING TASKS =====
    const [upcoming] = await db.query(
      `
      SELECT
        t.id,
        t.title,
        t.due_date,
        p.name AS project
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      JOIN projects p ON p.id = c.project_id
      WHERE p.workspace_id = ?
      AND t.due_date IS NOT NULL
      AND t.due_date >= CURDATE()
      AND c.name != 'Done'
      ORDER BY t.due_date ASC
      LIMIT 5
      `,
      [workspaceId]
    );

    // ===== ACTIVITY =====
    const [activity] = await db.query(
      `
      SELECT
        u.name AS user,
        a.action,
        a.target_type,
        a.created_at
      FROM activity_logs a
      JOIN users u ON u.id = a.user_id
      WHERE a.workspace_id = ?
      ORDER BY a.created_at DESC
      LIMIT 6
      `,
      [workspaceId]
    );

    res.json({
      stats: stat,
      chart,
      upcoming,
      activity,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      message: "Dashboard error",
      error: error.message,
    });
  }
};