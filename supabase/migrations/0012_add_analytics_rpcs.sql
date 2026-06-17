-- 0012_add_analytics_rpcs.sql
-- RPCs for Dashboard and Analytics aggregations to optimize frontend payload size

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_income NUMERIC;
  v_expense NUMERIC;
  v_net_profit NUMERIC;
  v_active_projects INT;
  v_completed_tasks INT;
  v_avg_mood NUMERIC;
  v_finance_trend JSONB;
  v_mood_trend JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Net Profit
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM finance_transactions
  WHERE user_id = v_user_id AND type = 'income'
    AND transaction_date >= p_start_date::date AND transaction_date <= p_end_date::date;

  SELECT COALESCE(SUM(amount), 0) INTO v_expense
  FROM finance_transactions
  WHERE user_id = v_user_id AND type = 'expense'
    AND transaction_date >= p_start_date::date AND transaction_date <= p_end_date::date;

  v_net_profit := v_income - v_expense;

  -- 2. Active Projects
  SELECT COUNT(*) INTO v_active_projects
  FROM projects
  WHERE user_id = v_user_id AND status = 'active';

  -- 3. Completed Tasks
  SELECT COUNT(*) INTO v_completed_tasks
  FROM tasks
  WHERE user_id = v_user_id AND status = 'done'
    AND COALESCE(updated_at, created_at) >= p_start_date AND COALESCE(updated_at, created_at) <= p_end_date;

  -- 4. Average Mood
  SELECT COALESCE(ROUND(AVG(mood_score)::numeric, 1), 0) INTO v_avg_mood
  FROM daily_logs
  WHERE user_id = v_user_id
    AND log_date >= p_start_date::date AND log_date <= p_end_date::date;

  -- 5. Finance Trend (group by date)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', t.t_date,
      'income', t.inc,
      'expense', t.exp
    )
  ), '[]'::jsonb) INTO v_finance_trend
  FROM (
    SELECT 
      transaction_date AS t_date,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS inc,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS exp
    FROM finance_transactions
    WHERE user_id = v_user_id
      AND transaction_date >= p_start_date::date AND transaction_date <= p_end_date::date
    GROUP BY transaction_date
    ORDER BY transaction_date ASC
  ) t;

  -- 6. Mood Trend
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', log_date,
      'mood', mood_score,
      'energy', energy_score
    )
  ), '[]'::jsonb) INTO v_mood_trend
  FROM (
    SELECT log_date, mood_score, energy_score
    FROM daily_logs
    WHERE user_id = v_user_id
      AND log_date >= p_start_date::date AND log_date <= p_end_date::date
    ORDER BY log_date ASC
  ) m;

  RETURN jsonb_build_object(
    'netProfit', v_net_profit,
    'activeProjectsCount', v_active_projects,
    'completedTasksCount', v_completed_tasks,
    'avgMood', v_avg_mood::text,
    'financeTrend', v_finance_trend,
    'moodTrend', v_mood_trend
  );
END;
$$;


CREATE OR REPLACE FUNCTION public.get_analytics_metrics(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_project_income JSONB;
  v_completed_tasks INT;
  v_active_tasks INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Project Income Data
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'name', t.p_name,
      'value', t.total_amount
    )
  ), '[]'::jsonb) INTO v_project_income
  FROM (
    SELECT 
      COALESCE(p.name, 'Bilinmeyen') AS p_name,
      SUM(f.amount) AS total_amount
    FROM finance_transactions f
    LEFT JOIN projects p ON f.project_id = p.id
    WHERE f.user_id = v_user_id AND f.type = 'income'
      AND f.transaction_date >= p_start_date::date AND f.transaction_date <= p_end_date::date
    GROUP BY p.name
    ORDER BY total_amount DESC
  ) t;

  -- 2. Task completion stats
  SELECT COUNT(*) INTO v_completed_tasks
  FROM tasks
  WHERE user_id = v_user_id AND status = 'done'
    AND COALESCE(due_at, created_at) >= p_start_date AND COALESCE(due_at, created_at) <= p_end_date;

  SELECT COUNT(*) INTO v_active_tasks
  FROM tasks
  WHERE user_id = v_user_id AND status != 'done' AND status != 'cancelled'
    AND COALESCE(due_at, created_at) >= p_start_date AND COALESCE(due_at, created_at) <= p_end_date;

  RETURN jsonb_build_object(
    'projectIncomeData', v_project_income,
    'completedTasks', v_completed_tasks,
    'activeTasks', v_active_tasks
  );
END;
$$;
